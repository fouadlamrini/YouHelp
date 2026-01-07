import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const About = ({ user }) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar user={user} />

      <section className="max-w-5xl mx-auto py-20 px-6">
        <h1 className="text-4xl font-bold mb-6">À propos de YouHelp</h1>
        <p className="text-gray-700 mb-4">
          YouHelp est une plateforme destinée aux étudiants et formateurs de YouCode pour partager des problèmes, des solutions et des connaissances pendant la formation.
        </p>
        <p className="text-gray-700 mb-4">
          Les utilisateurs peuvent poser des questions, publier des connaissances, participer à des workshops et collaborer avec leurs camarades.
        </p>
        <p className="text-gray-700">
          Les administrateurs ont la possibilité de gérer les utilisateurs, les posts, les connaissances et de visualiser les statistiques globales.
        </p>
      </section>

      <Footer />
    </div>
  );
};

export default About;
