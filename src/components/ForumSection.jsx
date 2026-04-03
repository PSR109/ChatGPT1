
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

const CATEGORIES = ["Rally", "F1", "GT", "Drift", "Eventos", "General"];

const styles = {
  wrap: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "8px 16px 104px",
    textAlign: "center",
  },
  card: {
    background: "rgba(17,24,39,0.92)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  },
  input: {
    width: "100%",
    background: "#0b1328",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "12px 14px",
    outline: "none",
    boxSizing: "border-box",
    fontSize: 15,
  },
  button: {
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
};

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

function inferCategoryFromContent(content = "") {
  const text = String(content || "").toLowerCase();
  if (text.includes("rally")) return "Rally";
  if (text.includes("f1") || text.includes("fórmula 1") || text.includes("formula 1")) return "F1";
  if (text.includes("gt")) return "GT";
  if (text.includes("drift")) return "Drift";
  if (text.includes("evento") || text.includes("cumpleaños") || text.includes("cumpleanos")) return "Eventos";
  return "General";
}

function buildPreviewTitle(content = "") {
  const clean = String(content || "").trim();
  if (!clean) return "Sin contenido";
  return clean.length > 72 ? `${clean.slice(0, 72).trim()}...` : clean;
}

export default function ForumSection({ isAdmin = false }) {
  const [topics, setTopics] = useState([]);
  const [repliesByPost, setRepliesByPost] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [submittingTopic, setSubmittingTopic] = useState(false);
  const [submittingReplyFor, setSubmittingReplyFor] = useState(null);
  const [errorText, setErrorText] = useState("");
  const [showCreateBox, setShowCreateBox] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 768;
  });
  const [topicForm, setTopicForm] = useState({
    content: "",
    category: "General",
  });
  const [replyDrafts, setReplyDrafts] = useState({});

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  async function loadTopics() {
    setLoading(true);
    setErrorText("");

    try {
      const { data, error } = await withTimeout(
        supabase
          .from("forum_posts")
          .select("*")
          .order("created_at", { ascending: false })
      );

      if (error) {
        setTopics([]);
        setErrorText("No se pudo cargar el foro.");
      } else {
        setTopics(Array.isArray(data) ? data : []);
      }
    } catch {
      setTopics([]);
      setErrorText("No se pudo cargar el foro. Revisa Supabase o vuelve a intentar.");
    } finally {
      setLoading(false);
    }
  }

  async function loadReplies(postId) {
    if (!postId) return;

    try {
      const { data, error } = await withTimeout(
        supabase
          .from("forum_replies")
          .select("*")
          .eq("post_id", postId)
          .order("created_at", { ascending: true })
      );

      if (!error) {
        setRepliesByPost((prev) => ({
          ...prev,
          [postId]: Array.isArray(data) ? data : [],
        }));
      }
    } catch {
      setRepliesByPost((prev) => ({
        ...prev,
        [postId]: [],
      }));
    }
  }

  async function handleCreateTopic(e) {
    e.preventDefault();
    const content = topicForm.content.trim();
    if (!content) return;

    setSubmittingTopic(true);
    setErrorText("");

    try {
      const { error } = await withTimeout(
        supabase.from("forum_posts").insert([
          {
            user_name: "Comunidad PSR",
            content,
          },
        ])
      );

      if (error) {
        setErrorText("No se pudo crear la conversación.");
      } else {
        setTopicForm({
          content: "",
          category: "General",
        });
        setShowCreateBox(false);
        await loadTopics();
      }
    } catch {
      setErrorText("No se pudo crear la conversación.");
    } finally {
      setSubmittingTopic(false);
    }
  }

  async function handleCreateReply(postId) {
    const content = (replyDrafts[postId] || "").trim();
    if (!content) return;

    setSubmittingReplyFor(postId);
    setErrorText("");

    try {
      const { error } = await withTimeout(
        supabase.from("forum_replies").insert([
          {
            post_id: postId,
            user_name: "Comunidad PSR",
            content,
          },
        ])
      );

      if (!error) {
        setReplyDrafts((prev) => ({
          ...prev,
          [postId]: "",
        }));
        await loadReplies(postId);
      } else {
        setErrorText("No se pudo publicar la respuesta.");
      }
    } catch {
      setErrorText("No se pudo publicar la respuesta.");
    } finally {
      setSubmittingReplyFor(null);
    }
  }

  async function handleDeleteTopic(postId) {
    const ok = window.confirm("¿Eliminar esta conversación?");
    if (!ok) return;

    try {
      await withTimeout(supabase.from("forum_replies").delete().eq("post_id", postId));
      await withTimeout(supabase.from("forum_posts").delete().eq("id", postId));

      setRepliesByPost((prev) => {
        const copy = { ...prev };
        delete copy[postId];
        return copy;
      });

      if (expandedPostId === postId) {
        setExpandedPostId(null);
      }

      await loadTopics();
    } catch {
      setErrorText("No se pudo eliminar la conversación.");
    }
  }

  async function handleDeleteReply(postId, replyId) {
    const ok = window.confirm("¿Eliminar este comentario?");
    if (!ok) return;

    try {
      await withTimeout(supabase.from("forum_replies").delete().eq("id", replyId));
      setRepliesByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((item) => item.id !== replyId),
      }));
    } catch {
      setErrorText("No se pudo eliminar el comentario.");
    }
  }

  async function toggleTopic(postId) {
    const nextId = expandedPostId === postId ? null : postId;
    setExpandedPostId(nextId);
    if (nextId) {
      await loadReplies(postId);
    }
  }

  const filteredTopics = useMemo(() => {
    if (selectedCategory === "Todas") return topics;
    return topics.filter((topic) => inferCategoryFromContent(topic?.content) === selectedCategory);
  }, [topics, selectedCategory]);

  const heroTitleSize = isMobile ? 28 : 38;
  const statGridColumns = isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fit, minmax(180px, 1fr))";

  return (
    <section style={styles.wrap}>
      <div
        style={{
          ...styles.card,
          padding: isMobile ? 16 : 22,
          textAlign: "left",
          background: "linear-gradient(180deg, rgba(17,24,39,0.96) 0%, rgba(11,19,40,0.96) 100%)",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: isMobile ? "1fr" : "1.25fr 0.75fr",
            alignItems: "stretch",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(37,99,235,0.16)",
                border: "1px solid rgba(59,130,246,0.35)",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.2,
                marginBottom: 10,
              }}
            >
              COMUNIDAD PSR
            </div>
            <h2 style={{ fontSize: heroTitleSize, margin: "0 0 6px", fontWeight: 800, lineHeight: 1.1 }}>
              Foro PSR
            </h2>
            <p
              style={{
                margin: "0 0 14px",
                opacity: 0.8,
                maxWidth: 680,
                lineHeight: 1.45,
                fontSize: isMobile ? 14 : 15,
              }}
            >
              Coordínate, pregunta, comparte ideas y arma carreras con otros pilotos sin salirte de la app.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {[
                "Buscar rivales",
                "Coordinar tandas",
                "Resolver dudas",
                "Proponer mejoras",
              ].map((item) => (
                <span
                  key={item}
                  style={{
                    padding: "7px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: statGridColumns,
              gap: 10,
              alignContent: "start",
            }}
          >
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 11, opacity: 0.68, marginBottom: 6 }}>TEMAS</div>
              <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 800 }}>{topics.length}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 11, opacity: 0.68, marginBottom: 6 }}>CATEGORÍAS</div>
              <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 800 }}>{CATEGORIES.length}</div>
            </div>
            <button
              onClick={() => setShowCreateBox((value) => !value)}
              style={{
                ...styles.button,
                gridColumn: isMobile ? "1 / -1" : "span 2",
                background: "#2563eb",
                color: "#fff",
                width: "100%",
                padding: isMobile ? "12px 14px" : "13px 14px",
                boxShadow: "0 10px 24px rgba(37,99,235,0.28)",
              }}
            >
              {showCreateBox ? "Cerrar" : "Abrir conversación"}
            </button>
          </div>
        </div>
      </div>

      {showCreateBox && (
        <div style={{ ...styles.card, textAlign: "left", padding: isMobile ? 14 : 18 }}>
          <h3 style={{ marginTop: 0, marginBottom: 8, textAlign: isMobile ? "left" : "center" }}>
            Nueva conversación
          </h3>
          <p style={{ margin: "0 0 14px", opacity: 0.72, textAlign: isMobile ? "left" : "center" }}>
            Úsalo para coordinar tandas, preguntar, proponer mejoras o buscar rivales.
          </p>

          <form onSubmit={handleCreateTopic}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 12,
                maxWidth: 760,
                margin: "0 auto",
              }}
            >
              <select
                style={styles.input}
                value={topicForm.category}
                onChange={(e) =>
                  setTopicForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <textarea
                style={{ ...styles.input, minHeight: 110, resize: "vertical" }}
                placeholder="Escribe tu pregunta, idea o propuesta"
                value={topicForm.content}
                onChange={(e) =>
                  setTopicForm((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
                  gap: 10,
                }}
              >
                <button
                  type="submit"
                  disabled={submittingTopic}
                  style={{
                    ...styles.button,
                    background: "#2563eb",
                    color: "#fff",
                    minWidth: 0,
                    width: "100%",
                    padding: "12px 14px",
                  }}
                >
                  {submittingTopic ? "Publicando..." : "Publicar conversación"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreateBox(false)}
                  style={{
                    ...styles.button,
                    background: "#0b1328",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.12)",
                    minWidth: 0,
                    width: "100%",
                    padding: "12px 14px",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div style={{ ...styles.card, textAlign: "left", padding: isMobile ? 14 : 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: isMobile ? "flex-start" : "center",
            flexDirection: isMobile ? "column" : "row",
            marginBottom: 12,
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>Categorías</h3>
            <div style={{ opacity: 0.66, fontSize: 13, marginTop: 4 }}>
              Filtra rápido lo que te interesa.
            </div>
          </div>
          <div style={{ opacity: 0.62, fontSize: 12, fontWeight: 700 }}>
            {filteredTopics.length} resultado{filteredTopics.length === 1 ? "" : "s"}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
            gap: 10,
            justifyContent: "stretch",
          }}
        >
          {["Todas", ...CATEGORIES].map((item) => {
            const active = selectedCategory === item;
            return (
              <button
                key={item}
                onClick={() => setSelectedCategory(item)}
                style={{
                  ...styles.button,
                  background: active ? "#2563eb" : "#0b1328",
                  color: "#fff",
                  border: active ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.12)",
                  padding: "10px 14px",
                  whiteSpace: "normal",
                  width: "100%",
                  boxShadow: active ? "0 8px 20px rgba(37,99,235,0.24)" : "none",
                }}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {errorText ? (
        <div style={styles.card}>{errorText}</div>
      ) : loading ? (
        <div style={styles.card}>Cargando...</div>
      ) : filteredTopics.length === 0 ? (
        <div style={styles.card}>No hay conversaciones todavía</div>
      ) : (
        filteredTopics.map((topic) => {
          const isOpen = expandedPostId === topic.id;
          const replies = repliesByPost[topic.id] || [];
          const previewTitle = buildPreviewTitle(topic.content);
          const category = topicForm.category || inferCategoryFromContent(topic.content);

          return (
            <div key={topic.id} style={{ ...styles.card, textAlign: "left", padding: isMobile ? 14 : 18 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: 12,
                  justifyContent: "space-between",
                  alignItems: isMobile ? "stretch" : "flex-start",
                }}
              >
                <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        background: "#0b1328",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 999,
                        padding: "6px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {category}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.62, fontWeight: 700 }}>
                      {replies.length} respuesta{replies.length === 1 ? "" : "s"}
                    </div>
                  </div>

                  <h3
                    style={{
                      margin: "0 0 8px",
                      lineHeight: 1.22,
                      fontSize: isMobile ? 20 : 24,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {previewTitle}
                  </h3>
                  <p style={{ margin: 0, opacity: 0.82, lineHeight: 1.5, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
                    {topic.content}
                  </p>

                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ opacity: 0.65, fontSize: 12 }}>{formatDate(topic.created_at)}</span>
                    {!isMobile && <span style={{ opacity: 0.28 }}>•</span>}
                    {!isMobile && <span style={{ opacity: 0.65, fontSize: 12 }}>{topic.user_name || "Comunidad PSR"}</span>}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "1fr",
                    gap: 10,
                    width: isMobile ? "100%" : 220,
                    flex: "0 0 auto",
                  }}
                >
                  <button
                    onClick={() => toggleTopic(topic.id)}
                    style={{
                      ...styles.button,
                      background: isOpen ? "rgba(37,99,235,0.18)" : "#0b1328",
                      color: "#fff",
                      border: isOpen ? "1px solid rgba(59,130,246,0.5)" : "1px solid rgba(255,255,255,0.12)",
                      width: "100%",
                      padding: "12px 14px",
                    }}
                  >
                    {isOpen ? "Ocultar" : "Ver"}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteTopic(topic.id)}
                      style={{
                        ...styles.button,
                        background: "#7f1d1d",
                        color: "#fff",
                        width: "100%",
                        padding: "12px 14px",
                      }}
                    >
                      Eliminar tema
                    </button>
                  )}
                </div>
              </div>

              {isOpen && (
                <div
                  style={{
                    marginTop: 16,
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    paddingTop: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: isMobile ? "flex-start" : "center",
                      flexDirection: isMobile ? "column" : "row",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <h4 style={{ margin: 0 }}>Conversación</h4>
                    <div style={{ opacity: 0.65, fontSize: 12 }}>
                      {replies.length} comentario{replies.length === 1 ? "" : "s"}
                    </div>
                  </div>

                  {replies.length === 0 ? (
                    <div
                      style={{
                        textAlign: isMobile ? "left" : "center",
                        opacity: 0.7,
                        marginBottom: 12,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 14,
                        padding: 14,
                      }}
                    >
                      Todavía nadie responde
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
                      {replies.map((reply, index) => (
                        <div
                          key={reply.id}
                          style={{
                            background: index % 2 === 0 ? "#0b1328" : "rgba(11,19,40,0.8)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 14,
                            padding: 14,
                          }}
                        >
                          <div style={{ whiteSpace: "pre-wrap", marginBottom: 10, lineHeight: 1.5, overflowWrap: "anywhere" }}>
                            {reply.content}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 10,
                              alignItems: isMobile ? "stretch" : "center",
                              flexDirection: isMobile ? "column" : "row",
                            }}
                          >
                            <span style={{ opacity: 0.65, fontSize: 12 }}>
                              {formatDate(reply.created_at)} · {reply.user_name || "Comunidad PSR"}
                            </span>

                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteReply(topic.id, reply.id)}
                                style={{
                                  ...styles.button,
                                  background: "#7f1d1d",
                                  color: "#fff",
                                  padding: "10px 12px",
                                  width: isMobile ? "100%" : "auto",
                                }}
                              >
                                Eliminar comentario
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 14,
                      padding: isMobile ? 12 : 14,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Responder conversación</div>
                    <textarea
                      style={{ ...styles.input, minHeight: 96, resize: "vertical" }}
                      placeholder="Responder conversación"
                      value={replyDrafts[topic.id] || ""}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({
                          ...prev,
                          [topic.id]: e.target.value,
                        }))
                      }
                    />
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <button
                        onClick={() => handleCreateReply(topic.id)}
                        disabled={submittingReplyFor === topic.id}
                        style={{
                          ...styles.button,
                          background: "#16a34a",
                          color: "#fff",
                          minWidth: isMobile ? "100%" : 220,
                          width: isMobile ? "100%" : "auto",
                          padding: "12px 14px",
                        }}
                      >
                        {submittingReplyFor === topic.id ? "Publicando..." : "Responder"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </section>
  );
}
