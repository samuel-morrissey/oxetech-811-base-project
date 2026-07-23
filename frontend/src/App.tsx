import React from "react";

function App() {
  return (
    <>
      <div className="bg-gradients">
        <div className="grad-1"></div>
        <div className="grad-2"></div>
      </div>

      <main className="card">
        <header>
          <div className="logo-container">
            <span className="logo">🚀</span>
          </div>
          <h1>Oxetech Helpdesk</h1>
          <p className="subtitle">Portal do Usuário - Web</p>
        </header>

        <section>
          <div className="status-bar">
            <div className="status-label">
              <div className="ping-indicator"></div>
              <span>API Status</span>
            </div>
            <span className="status-badge">Online</span>
          </div>

          <h2 className="section-title">Estrutura Monorepo</h2>
          <div className="folder-list">
            <div className="folder-item">
              <span>📁 backend/</span>
              <span className="folder-tech-backend">Express + Prisma</span>
            </div>
            <div className="folder-item">
              <span>📁 frontend/</span>
              <span className="folder-tech-frontend">React + Vite (Esta Tela)</span>
            </div>
            <div className="folder-item">
              <span>📁 mobile/</span>
              <span className="folder-tech-mobile">React Native (Espaço Reservado)</span>
            </div>
          </div>

          <div className="footer">
            Pronto para iniciar o desenvolvimento do painel integrado.
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
