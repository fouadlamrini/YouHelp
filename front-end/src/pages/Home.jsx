export default function Home() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-24">
        <div className="max-w-6xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Mar7ba bik f YouHelp
          </h1>
          <p className="text-lg mb-8">
            plateforme dyal ta3awon w partage dyal knowledge bin apprenant dyal YouCode
          </p>
          <a
            href="/register"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Get Started
          </a>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Roles</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              ["Admin", "Gestion users, posts, categories"],
              ["Formateur", "Accompagnement et réponses expertes"],
              ["Etudiant", "Posts, commentaires, partage knowledge"],
              ["Connected", "Lecture et fonctionnalités limitées"],
            ].map(([title, desc]) => (
              <div key={title} className="bg-white p-6 rounded-xl shadow hover:scale-105 transition">
                <h3 className="font-bold text-xl mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Fonctionnalités principales
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              "Publication de problèmes",
              "Commentaires & réponses",
              "Partage knowledge",
              "Messages privés",
              "Appels vidéo",
              "Favoris & collaboration",
            ].map(feature => (
              <div
                key={feature}
                className="border p-6 rounded-lg text-center hover:shadow-lg transition"
              >
                <p className="font-semibold">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
