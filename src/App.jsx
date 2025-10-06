import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AnimatedBackground from "./components/AnimatedBackground.jsx";

export default function WeddingInvite() {
  const initial = { name: "", attendance: "yes", alcohol: [], message: "" };
  const [form, setForm] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rsvp:Юбилей")) || initial;
    } catch {
      return initial;
    }
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    localStorage.setItem("rsvp:Юбилей", JSON.stringify(form));
  }, [form]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    if (name === "alcohol") {
      const nonAlcoholicOption = "Не пью алкоголь";

      if (value === nonAlcoholicOption && checked) {
        setForm((f) => ({ ...f, alcohol: [nonAlcoholicOption] }));
        return;
      }

      setForm((f) => {
        const next = new Set(f.alcohol);

        if (checked) {
          next.add(value);
          next.delete(nonAlcoholicOption);
        } else {
          next.delete(value);
        }

        return { ...f, alcohol: Array.from(next) };
      });
      return;
    }

    setForm((f) => ({ ...f, [name]: value }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Пожалуйста, укажите имя и фамилию.";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    try {
      const response = await fetch("http://localhost:3001/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Server response:", result);
      setSubmitted(true);
    } catch (error) {
      console.error("Ошибка при отправке формы:", error);
      alert(
        "Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз или свяжитесь с нами напрямую."
      );
    }
  }

  function resetForm() {
    setForm(initial);
    setSubmitted(false);
    setErrors({});
    localStorage.removeItem("rsvp:Юбилей");
  }

  const alcoholOptions = [
    "Игристое (сухое, Брют)",
    "Игристое (полусладкое)",
    "Вино белое (сухое)",
    "Вино белое (полусладкое)",
    "Вино красное (сухое)",
    "Вино красное (полусладкое)",
    "Водка",
    "Коньяк",
    "Не пью алкоголь",
  ];

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, -120]);
  const y2 = useTransform(scrollY, [0, 800], [0, -220]);

  const progressRef = useRef(null);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <main className="min-h-screen bg-black text-white antialiased overflow-x-hidden">
      <AnimatedBackground />
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/70 to-transparent backdrop-blur p-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="leading-4">
              <div className="text-xs text-gray-300">Александр</div>
              <div className="text-sm font-medium">27 сентября 2025</div>
            </div>
          </div>
          <nav className="text-xs text-gray-300 hidden sm:flex gap-3">
            <a href="#hero">Главная</a>
            <a href="#program">Расписание</a>
            <a href="#rsvp">RSVP</a>
          </nav>
        </div>
      </header>

      <div className="pt-20 relative z-10">
        <section
          id="hero"
          className="min-h-screen flex items-end md:items-center p-6 md:p-12 relative overflow-hidden"
        >
          <div className="max-w-3xl mx-auto text-center md:text-left pb-12 md:pb-0">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.7 }}
              className="text-4xl sm:text-5xl font-extrabold tracking-tight"
            >
              Ю Б И Л Е Й!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ amount: 0.2 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-sm text-gray-300"
            >
              Приглашаю отметить свое день рождения и разделить этот теплый
              вечер вместе со мной 20 декабря 2025 года!
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ amount: 0.2 }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex flex-col sm:flex-row gap-3 justify-center md:justify-start"
            >
              <a
                href="#rsvp"
                className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-rose-500 text-black font-semibold"
              >
                Подтвердить приход
              </a>
              <a
                href="#program"
                className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-gray-700"
              >
                Расписание дня
              </a>
            </motion.div>
          </div>
        </section>

        <section
          id="program"
          className="min-h-screen p-6 md:p-12 bg-transparent"
        >
          <div className="max-w-3xl mx-auto">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              variants={fadeUp}
              className="text-2xl font-semibold mb-4"
            >
              Расписание
            </motion.h2>
            <div className="space-y-4">
              <motion.article
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ amount: 0.25 }}
                transition={{ delay: 0.12 }}
                className="p-4 bg-zinc-900 rounded-xl border border-zinc-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-medium">
                      Начало мероприятия
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">17:00</div>
                </div>
              </motion.article>
            </div>
            <motion.div
              className="mt-8 text-sm text-gray-400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ amount: 0.2 }}
            >
              Адрес: «Королева вдохновения», г. Краснодар, ул. имени 40-летия
              Победы, 170/1 — рекомендую строить маршрут заранее!
            </motion.div>
          </div>
        </section>

        <section id="rsvp" className="min-h-screen p-6 md:p-12 bg-transparent">
          <div className="max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.2 }}
              className="text-2xl font-semibold mb-4"
            >
              Подтвердить присутствие
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ amount: 0.2 }}
              className="bg-black/60 p-4 rounded-xl border border-zinc-800"
            >
              {submitted ? (
                <div className="text-green-400">
                  Спасибо — ваш ответ получен. Спасибо за уделенное время!
                  <div className="mt-4">
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 rounded bg-zinc-800/70"
                    >
                      Отправить другой ответ
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-300">
                      Ваше имя и фамилия
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full mt-2 p-3 rounded bg-zinc-800 border border-zinc-700 text-white"
                    />
                    {errors.name && (
                      <div className="text-rose-400 text-xs mt-1">
                        {errors.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs text-gray-300">Принять участие</div>
                    <div className="mt-2 flex gap-2">
                      <label className="inline-flex items-center gap-2 bg-zinc-800 p-2 rounded">
                        <input
                          type="radio"
                          name="attendance"
                          value="yes"
                          checked={form.attendance === "yes"}
                          onChange={handleChange}
                        />
                        <span className="text-xs">Смогу</span>
                      </label>
                      <label className="inline-flex items-center gap-2 bg-zinc-800 p-2 rounded">
                        <input
                          type="radio"
                          name="attendance"
                          value="maybe"
                          checked={form.attendance === "maybe"}
                          onChange={handleChange}
                        />
                        <span className="text-xs">Может быть</span>
                      </label>
                      <label className="inline-flex items-center gap-2 bg-zinc-800 p-2 rounded">
                        <input
                          type="radio"
                          name="attendance"
                          value="no"
                          checked={form.attendance === "no"}
                          onChange={handleChange}
                        />
                        <span className="text-xs">Не смогу</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-300">
                      Какой алкоголь предпочитаете?
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {alcoholOptions.map((a) => (
                        <label
                          key={a}
                          className="inline-flex items-center gap-2 bg-zinc-800 p-2 rounded text-xs"
                        >
                          <input
                            type="checkbox"
                            name="alcohol"
                            value={a}
                            checked={form.alcohol.includes(a)}
                            onChange={handleChange}
                          />
                          <span>{a}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-300">
                      Сообщение / пожелание
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      className="w-full mt-2 p-3 rounded bg-zinc-800 border border-zinc-700 text-white"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 rounded bg-rose-500 text-black font-semibold"
                    >
                      Отправить
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(initial)}
                      className="px-4 py-3 rounded border border-zinc-700"
                    >
                      Отменить
                    </button>
                  </div>

                  <div className="text-xs text-gray-500">
                    Один человек - 1 заявка. Пожалуйста, ответьте до 15 декабря
                    — это поможет нам в организации.
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </section>

        <section className="py-12 px-6 bg-black">
          <div className="max-w-3xl mx-auto text-center text-sm text-gray-400">
            <div className="mb-4">
              Контакты организатора: Анна —{" "}
              <a href="tel:+79628584593" className="underline">
                +7 (918) 482-83-20
              </a>
            </div>
            <div className="text-xs">С любовью, Александр - до встречи!</div>
          </div>
        </section>
      </div>
    </main>
  );
}
