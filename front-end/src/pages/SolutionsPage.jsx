import React from "react";
import SolutionCard from "../components/SolutionCard";
import Sidebar from "../components/Sidebar";
import NavbarLoggedIn from "../components/NavbarLoggedIn";

const SolutionsPage = () => {
  const solutionsData = [
    {
      id: 1,
      postContent: "j'ai probleme au niveau de hooks dans react, useEffect ne s'arrête pas de s'exécuter.",
      solution: {
        id: 101,
        description: "Le problème était l'oubli du tableau de dépendances []. En ajoutant les variables nécessaires dans le tableau, le hook ne s'exécute que lorsque ces variables changent."
      }
    },
    {
      id: 2,
      postContent: "Mochkil f l-marche dyal Mercedes 190, ma bghatch t-demarrer s-shaba.",
      solution: {
        id: 102,
        description: "Après diagnostic, il s'est avéré que le relais de la pompe à carburant était défectueux. Le remplacement de la pièce a réglé le problème immédiatement."
      }
    },
    {
      id: 3,
      postContent: "Fuit de l'eau sous l'évier de la cuisine, j'ai tout essayé mais ça coule encore.",
      solution: {
        id: 103,
        description: "" // Ghadi t-ban hna l-button dyal "Créer description"
      }
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <NavbarLoggedIn />
        <main className="flex-grow overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto pb-20">
            <header className="mb-10">
              <h1 className="text-2xl font-black text-slate-900 uppercase">Mes Solutions</h1>
              <p className="text-slate-500 font-medium">Historique des problèmes résolus et leurs explications.</p>
            </header>

            {solutionsData.map((item) => (
              <SolutionCard 
                key={item.id} 
                solution={item.solution} 
                postContent={item.postContent} 
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SolutionsPage;