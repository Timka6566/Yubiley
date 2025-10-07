import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import image from "C:/Users/104/Desktop/vanya-masha/src/assets/images/pisatlet2.jpg";

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
    "Игристое (сухое, брют)",
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
    <main className="min-h-screen bg-white text-black antialiased overflow-x-hidden">
      <header
        className="relative w-full h-96 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="absolute inset-0 bg-gray/30 flex flex-col items-center justify-center text-center pt-20">
          <h1
            className="text-gold text-9xl  font-marck-script"
            style={{ textShadow: "10px 8px 8px rgba(0, 0, 0, 0.5)" }}> 
          
          </h1>
          <p
            className="text-black text-4xl mt-20 max-w-md font-marck-script"
            style={{ textShadow: "4px 1px 4px rgba(255, 255, 255, 1)" }}
          >
            <br />
            <br />
            <br />
            <br />
            
            <br />
            <br />
            Дорогие друзья и близкие!
            <br />
            <br />
            <br />
            <br />
          </p>
        </div>
        <div className="absolute inset-0 bg-gray/30 flex flex-col items-center justify-center text-center pt-20"> 
          <p 
           className="text-gold text-4xl mt-20 max-w-md font-marck-script"
            style={{ textShadow: "1px 1px 1px rgba(0, 0, 0, 0.5)" }}
            >
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
               Приглашаю вас отметить мой день рождения!
            </p>
        </div>
      </header>
      <div className="relative z-10">
        <section
          id="program"
          className="p-6 md:p-12 bg-transparent"
        >
          <div className="max-w-3xl mx-8">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              variants={fadeUp}
              className="text-4xl text-gold font-bad-script mb-3"
            >
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              Буду очень рад видеть каждого из вас, чтобы отпраздновать это
            замечательное событие вместе.
            <br />
            <br />
              <div className="text-2xl text-black font-bad-script mb-3">
                <center><h3>Жду вас</h3></center>
              20 декабря 2025 года в 17:00 <br /> <br /><center>в Банкет холле</center><center>"Королева Вдохновения"</center> <br />
              <div className="text-xl text-black font-bad-script mb-3">
                по адресу: <a href="https://yandex.ru/profile/193952854290?lang=ru">ул. имени 40-летия Победы, 170/1</a>
              </div>
              </div>
            </motion.h2>
           
            <motion.div
              className="mt-8 text-sm text-gray-400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ amount: 0.2 }}
            >
            </motion.div>
          </div>
        </section>

        <section id="rsvp" className="p-6 md:p-12 bg-transparent">
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
              className="bg-gray-100 p-6 rounded-lg border border-gray-200"
            >
              {submitted ? (
                <div className="text-black-500">
                  Спасибо — ваш ответ получен. Спасибо за уделенное время!
                  <div className="mt-4">
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 rounded bg-gray-200"
                    >
                      Отправить другой ответ
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-700">
                      Ваше имя и фамилия
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full mt-2 p-3 rounded bg-white border border-gray-300 text-black"
                    />
                    {errors.name && (
                      <div className="text-rose-400 text-xs mt-1">
                        {errors.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs text-gray-700">Принять участие</div>
                    <div className="mt-2 flex gap-2">
                      <label className="inline-flex items-center gap-2 bg-gray-200 p-2 rounded">
                        <input
                          type="radio"
                          name="attendance"
                          value="yes"
                          checked={form.attendance === "yes"}
                          onChange={handleChange}
                        />
                        <span className="text-xs">Смогу</span>
                      </label>
                      <label className="inline-flex items-center gap-2 bg-gray-200 p-2 rounded">
                        <input
                          type="radio"
                          name="attendance"
                          value="maybe"
                          checked={form.attendance === "maybe"}
                          onChange={handleChange}
                        />
                        <span className="text-xs">Может быть</span>
                      </label>
                      <label className="inline-flex items-center gap-2 bg-gray-200 p-2 rounded">
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
                    <div className="text-xs text-gray-700">
                      Какой алкоголь предпочитаете?
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {alcoholOptions.map((a) => (
                        <label
                          key={a}
                          className="inline-flex items-center gap-2 bg-gray-200 p-2 rounded text-xs"
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
                    <label className="block text-xs text-gray-700">
                      Сообщение / пожелание
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      className="w-full mt-2 p-3 rounded bg-white border border-gray-300 text-black"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                     type="submit"
                      className="flex-1 px-4 py-3 rounded bg-yellow-600 text-black font-semibold"
                    > Отправить
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(initial)}
                      className="px-4 py-3 rounded border border-gray-300 bg-gray-200 hover:bg-gray-300"
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

        <section className="py-12 px-6 bg-white">
          <div className="max-w-3xl mx-auto text-center text-sm text-gray-600">
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