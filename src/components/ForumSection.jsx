import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

const CATEGORIES = ["Rally", "F1", "GT", "Drift", "Eventos", "General"];

const styles = {
  wrap: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "8px 16px 40px",
    textAlign: "center",
  },
  card: {
    background: "rgba(17,24,39,0.92)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
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

export default function ForumSection({ isAdmin = false }) {
  const [topics, setTopics] = useState([]);
  const [postsByTopic, setPostsByTopic] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const [submittingTopic, setSubmittingTopic] = useState(false);
  const [submittingReplyFor, setSubmittingReplyFor] = useState(null);
  const [errorText, setErrorText] = useState("");
  const [showCreateBox, setShowCreateBox] = useState(false);
  const [topicForm, setTopicForm] = useState({
    title: "",
    content: "",
    category: "General",
  });
  const [replyDrafts, setReplyDrafts] = useState({});

  useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    setLoading(true);
    setErrorText("");

    try {
      const { data, error } = await withTimeout(
        supabase.from("forum_topics").select("*").order("created_at", { ascending: false })
      );

      if (error) {
        setTopics([]);
        setErrorText("No se pudo cargar el foro.");
      } else {
        setTopics(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      setTopics([]);
      setErrorText("No se pudo cargar el foro. Revisa Supabase o vuelve a intentar.");
    } finally {
      setLoading(false);
    }
  }

  async function loadPosts(topicId) {
    if (!topicId || postsByTopic[topicId]) return;

    try {
      const { data, error } = await withTimeout(
        supabase
          .from("forum_posts")
          .select("*")
          .eq("topic_id", topicId)
          .order("created_at", { ascending: true })
      );

      if (!error) {
        setPostsByTopic((prev) => ({
          ...prev,
          [topicId]: Array.isArray(data) ? data : [],
        }));
      }
    } catch (error) {
      setPostsByTopic((prev) => ({
        ...prev,
        [topicId]: [],
      }));
    }
  }

  async function handleCreateTopic(e) {
    e.preventDefault();
    if (!topicForm.title.trim() || !topicForm.content.trim()) return;

    setSubmittingTopic(true);
    setErrorText("");

    try {
      const { error } = await withTimeout(
        supabase.from("forum_topics").insert([
          {
            title: topicForm.title.trim(),
            content: topicForm.content.trim(),
            category: topicForm.category || "General",
          },
        ])
      );

      if (error) {
        setErrorText("No se pudo crear el tema.");
      } else {
        setTopicForm({
          title: "",
          content: "",
          category: "General",
        });
        setShowCreateBox(false);
        await loadTopics();
      }
    } catch (error) {
      setErrorText("No se pudo crear el tema.");
    } finally {
      setSubmittingTopic(false);
    }
  }

  async function handleDeleteTopic(topicId) {
    const ok = window.confirm("¿Eliminar este tema?");
    if (!ok) return;

    try {
      await withTimeout(supabase.from("forum_posts").delete().eq("topic_id", topicId));
      await withTimeout(supabase.from("forum_topics").delete().eq("id", topicId));

      setPostsByTopic((prev) => {
        const copy = { ...prev };
        delete copy[topicId];
        return copy;
      });

      if (expandedTopicId === topicId) {
        setExpandedTopicId(null);
      }

      await loadTopics();
    } catch (error) {
      setErrorText("No se pudo eliminar el tema.");
    }
  }

  async function handleCreateReply(topicId) {
    const content = (replyDrafts[topicId] || "").trim();
    if (!content) return;

    setSubmittingReplyFor(topicId);

    try {
      const { error } = await withTimeout(
        supabase.from("forum_posts").insert([
          {
            topic_id: topicId,
            content,
          },
        ])
      );

      if (!error) {
        setReplyDrafts((prev) => ({
          ...prev,
          [topicId]: "",
        }));

        const { data } = await withTimeout(
          supabase
            .from("forum_posts")
            .select("*")
            .eq("topic_id", topicId)
            .order("created_at", { ascending: true })
        );

        setPostsByTopic((prev) => ({
          ...prev,
          [topicId]: Array.isArray(data) ? data : [],
        }));

        await loadTopics();
      }
    } catch (error) {
      setErrorText("No se pudo publicar la respuesta.");
    } finally {
      setSubmittingReplyFor(null);
    }
  }

  async function handleDeleteReply(topicId, replyId) {
    const ok = window.confirm("¿Eliminar este comentario?");
    if (!ok) return;

    try {
      await withTimeout(supabase.from("forum_posts").delete().eq("id", replyId));

      setPostsByTopic((prev) => ({
        ...prev,
        [topicId]: (prev[topicId] || []).filter((item) => item.id !== replyId),
      }));
    } catch (error) {
      setErrorText("No se pudo eliminar el comentario.");
    }
  }

  async function toggleTopic(topicId) {
    const nextId = expandedTopicId === topicId ? null : topicId;
    setExpandedTopicId(nextId);
    if (nextId) {
      await loadPosts(topicId);
    }
  }

  const filteredTopics = useMemo(() => {
    if (selectedCategory === "Todas") return topics;
    return topics.filter((topic) => topic.category === selectedCategory);
  }, [topics, selectedCategory]);

  return (
    <section style={styles.wrap}>
      <h2 style={{ fontSize: 38, margin: "0 0 6px", fontWeight: 800 }}>Foro PSR</h2>
      <p style={{ margin: "0 0 18px", opacity: 0.78 }}>
        Aprende, pregunta, organiza carreras y conversa fácil.
      </p>

      <div
        style={{
          ...styles.card,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          textAlign: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.68, marginBottom: 6 }}>TEMAS</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{topics.length}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.68, marginBottom: 6 }}>CATEGORÍAS</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{CATEGORIES.length}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.68, marginBottom: 6 }}>ACCIÓN</div>
          <button
            onClick={() => setShowCreateBox((value) => !value)}
            style={{
              ...styles.button,
              background: "#2563eb",
              color: "#fff",
              minWidth: 180,
            }}
          >
            {showCreateBox ? "Cerrar" : "Crear tema"}
          </button>
        </div>
      </div>

      {showCreateBox && (
        <div style={styles.card}>
          <h3 style={{ marginTop: 0, marginBottom: 14 }}>Nuevo tema</h3>

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
              <input
                style={styles.input}
                placeholder="Título del tema"
                value={topicForm.title}
                onChange={(e) =>
                  setTopicForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />

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

              <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="submit"
                  disabled={submittingTopic}
                  style={{
                    ...styles.button,
                    background: "#2563eb",
                    color: "#fff",
                    minWidth: 200,
                  }}
                >
                  {submittingTopic ? "Publicando..." : "Publicar tema"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreateBox(false)}
                  style={{
                    ...styles.button,
                    background: "#0b1328",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.12)",
                    minWidth: 160,
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div style={styles.card}>
        <h3 style={{ marginTop: 0, marginBottom: 14 }}>Categorías</h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
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
        <div style={styles.card}>No hay temas todavía</div>
      ) : (
        filteredTopics.map((topic) => {
          const isOpen = expandedTopicId === topic.id;
          const posts = postsByTopic[topic.id] || [];

          return (
            <div key={topic.id} style={{ ...styles.card, textAlign: "left" }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: "1 1 520px" }}>
                  <div
                    style={{
                      display: "inline-block",
                      background: "#0b1328",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 999,
                      padding: "6px 10px",
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    {topic.category || "General"}
                  </div>

                  <h3 style={{ margin: "0 0 6px", lineHeight: 1.2 }}>{topic.title}</h3>
                  <p style={{ margin: 0, opacity: 0.82 }}>{topic.content}</p>

                  <div style={{ marginTop: 10, opacity: 0.65, fontSize: 12 }}>
                    {formatDate(topic.created_at)}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    flex: "0 1 auto",
                  }}
                >
                  <button
                    onClick={() => toggleTopic(topic.id)}
                    style={{
                      ...styles.button,
                      background: "#0b1328",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {isOpen ? "Ocultar respuestas" : "Ver respuestas"}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteTopic(topic.id)}
                      style={{
                        ...styles.button,
                        background: "#7f1d1d",
                        color: "#fff",
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
                  <h4 style={{ marginTop: 0, marginBottom: 12, textAlign: "center" }}>
                    Respuestas
                  </h4>

                  {posts.length === 0 ? (
                    <div style={{ textAlign: "center", opacity: 0.7, marginBottom: 12 }}>
                      Todavía no hay respuestas
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          style={{
                            background: "#0b1328",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 14,
                            padding: 14,
                          }}
                        >
                          <div style={{ whiteSpace: "pre-wrap", marginBottom: 8 }}>{post.content}</div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 10,
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <span style={{ opacity: 0.65, fontSize: 12 }}>
                              {formatDate(post.created_at)}
                            </span>

                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteReply(topic.id, post.id)}
                                style={{
                                  ...styles.button,
                                  background: "#7f1d1d",
                                  color: "#fff",
                                  padding: "8px 12px",
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

                  <div style={{ display: "grid", gap: 10 }}>
                    <textarea
                      style={{ ...styles.input, minHeight: 90, resize: "vertical" }}
                      placeholder="Responder tema"
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
                          minWidth: 220,
                        }}
                      >
                        {submittingReplyFor === topic.id ? "Publicando..." : "Publicar respuesta"}
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
