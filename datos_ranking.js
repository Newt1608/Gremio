<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ranking - Mi Casita</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root {
            --sidebar-bg: #292437; --sidebar-text: #9691a5; --sidebar-text-active: #ffffff;
            --sidebar-bg-active: #3c354e; --sidebar-btn: #fdd843; --main-bg: #f9f5ed;
            --card-bg: #ffffff; --text-dark: #201b2a; --text-muted: #7d7889;
            --accent-red: #d84d65; --border-color: #e8e4dc; --transition-speed: 0.3s;
        }

        [data-theme="dark"] {
            --main-bg: #181521; --card-bg: #221e2d; --text-dark: #f0eef5;
            --text-muted: #a39eb5; --border-color: #353045; --sidebar-bg: #14111c;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
        body { display: flex; height: 100vh; background-color: var(--main-bg); color: var(--text-dark); transition: background-color var(--transition-speed), color var(--transition-speed); overflow: hidden; }

        .sidebar { width: 260px; background-color: var(--sidebar-bg); color: var(--sidebar-text); display: flex; flex-direction: column; transition: width var(--transition-speed); overflow-y: auto; overflow-x: hidden; flex-shrink: 0; }
        .sidebar.collapsed { width: 0; padding: 0; }
        .sidebar-header { padding: 24px; display: flex; align-items: center; gap: 12px; margin-bottom: 10px; min-width: 260px; }
        .sidebar-header img { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
        .nav-group { margin-bottom: 10px; min-width: 260px; }
        .nav-title { padding: 10px 24px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; }
        .nav-title:hover { color: var(--sidebar-text-active); }
        .nav-title i { transition: transform 0.3s ease; }
        .nav-group.collapsed-group .nav-title i { transform: rotate(-90deg); }
        .nav-items-container { max-height: 300px; overflow: hidden; transition: max-height 0.3s ease-in-out; }
        .nav-group.collapsed-group .nav-items-container { max-height: 0; }
        .nav-item { padding: 10px 24px; display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 14px; font-weight: 600; text-decoration: none; color: var(--sidebar-text); transition: 0.2s; }
        .nav-item:hover { color: var(--sidebar-text-active); }
        .nav-item.active { background-color: var(--sidebar-bg-active); color: var(--sidebar-text-active); border-left: 4px solid var(--sidebar-btn); }

        .main-content { flex: 1; display: flex; flex-direction: column; overflow-y: auto; padding-bottom: 80px; }
        .topbar { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; }
        .breadcrumbs { display: flex; align-items: center; gap: 15px; font-size: 14px; color: var(--text-muted); }
        .toggle-btn, .theme-btn { background: none; border: none; color: var(--text-dark); font-size: 20px; cursor: pointer; padding: 8px; border-radius: 50%; background-color: var(--card-bg); box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: 0.3s; }
        .dashboard-container { padding: 20px 40px 60px 40px; max-width: 1400px; margin: 0 auto; width: 100%; }
        
        .welcome-header { margin-bottom: 30px; }
        .welcome-header h1 { font-size: 42px; font-weight: 800; margin-bottom: 12px; }
        .welcome-header h1 span { color: var(--sidebar-btn); }
        .welcome-tag { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }

        .card { background-color: var(--card-bg); border-radius: 24px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid var(--border-color); }

        .ranking-container { overflow-x: auto; }
        table { width: 100%; border-collapse: separate; border-spacing: 0 10px; min-width: 950px; }
        th { text-align: center; padding: 10px 15px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); }
        td { background: var(--main-bg); padding: 12px 15px; text-align: center; font-weight: 600; font-size: 14px; border-top: 1px solid transparent; border-bottom: 1px solid transparent; }
        td:first-child { border-radius: 12px 0 0 12px; border-left: 1px solid transparent; }
        td:last-child { border-radius: 0 12px 12px 0; border-right: 1px solid transparent; }
        
        .perfil-celda { display: flex; align-items: center; gap: 15px; text-align: left; }
        .foto-perfil { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; background: var(--border-color); }
        
        .top-5 td { background: linear-gradient(90deg, rgba(253, 216, 67, 0.15) 0%, rgba(253, 216, 67, 0.05) 100%); border-top: 1px solid rgba(253, 216, 67, 0.5); border-bottom: 1px solid rgba(253, 216, 67, 0.5); }
        .top-5 td:first-child { border-left: 2px solid #fdd843; box-shadow: -5px 0 15px rgba(253, 216, 67, 0.2); }
        .top-5 td:last-child { border-right: 1px solid rgba(253, 216, 67, 0.5); }
        .top-5 .pos-numero { color: #d89614; font-size: 18px; text-shadow: 0 0 10px rgba(253, 216, 67, 0.5); }
        .elemento-icon { font-size: 14px; margin-right: 4px; }

        @media (max-width: 1100px) { .sidebar { position: absolute; height: 100%; z-index: 100; } }
    </style>
</head>
<body>

    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <img src="logo.jpg" alt="Logo">
            <div>
                <h2>Mi Casita</h2>
                <p>Gremio de Guardian Tales</p>
            </div>
        </div>

        <div class="nav-group">
            <div class="nav-title">INICIO <i class="fa-solid fa-chevron-down"></i></div>
            <div class="nav-items-container">
                <a href="index.html" class="nav-item"><i class="fa-solid fa-fire"></i> Fogata de bienvenida</a>
                <a href="noticias.html" class="nav-item"><i class="fa-regular fa-newspaper"></i> Noticias del gremio</a>
            </div>
        </div>

        <div class="nav-group">
            <div class="nav-title">GREMIO <i class="fa-solid fa-chevron-down"></i></div>
            <div class="nav-items-container">
                <a href="resumen.html" class="nav-item"><i class="fa-solid fa-chart-pie"></i> Resumen del gremio</a>
                <a href="guia.html" class="nav-item"><i class="fa-solid fa-book-bookmark"></i> Guía</a>
                <a href="ranking.html" class="nav-item active"><i class="fa-solid fa-trophy"></i> Ranking de la casa</a>
            </div>
        </div>
        
        <div class="nav-group">
            <div class="nav-title">CUENTOS DE GUARDIANES <i class="fa-solid fa-chevron-down"></i></div>
            <div class="nav-items-container">
                <a href="heroes.html" class="nav-item"><i class="fa-solid fa-khanda"></i> Héroes</a>
                <a href="equipos.html" class="nav-item"><i class="fa-solid fa-shield-halved"></i> Equipos</a>
                <!-- Link a Incursiones centralizado -->
                <a href="incursiones.html" class="nav-item"><i class="fa-solid fa-ghost"></i> Incursiones</a>
                <a href="recursos.html" class="nav-item"><i class="fa-regular fa-gem"></i> Recursos</a>
            </div>
        </div>

        <div class="nav-group" style="margin-top: auto; padding-bottom: 20px;">
            <div class="nav-items-container" style="max-height: none;">
                <a href="preferencias.html" class="nav-item"><i class="fa-solid fa-gear"></i> Preferencias</a>
                <a href="ayuda.html" class="nav-item"><i class="fa-regular fa-circle-question"></i> Ayuda y atajos</a>
            </div>
        </div>
    </aside>

    <main class="main-content">
        <div class="topbar">
            <div class="breadcrumbs">
                <button class="toggle-btn" id="toggleSidebar"><i class="fa-solid fa-bars"></i></button>
                <span>Mi Casita &nbsp; > &nbsp; <b>Ranking de la casa</b></span>
            </div>
            <button class="theme-btn" id="themeToggle"><i class="fa-solid fa-moon"></i></button>
        </div>

        <div class="dashboard-container">
            <div class="welcome-header">
                <div class="welcome-tag"><i class="fa-solid fa-trophy" style="color: #fdd843;"></i> Asalto del Gremio</div>
                <h1>Ranking del último <span>Asalto.</span></h1>
                <p>Clasificación de los miembros por su daño en asalto y récords en la sala de práctica (Estafermo).</p>
            </div>

            <div class="card ranking-container">
                <table id="tabla-ranking">
                    <thead>
                        <tr>
                            <th rowspan="2" style="text-align: left; width: 50px; border-bottom: 2px solid var(--border-color);">Pos</th>
                            <th rowspan="2" style="text-align: left; border-bottom: 2px solid var(--border-color);">Miembro</th>
                            <th rowspan="2" style="border-bottom: 2px solid var(--border-color); color: var(--text-dark); font-size: 12px;">Daño Máximo<br><span style="font-size: 9px; color: var(--text-muted);">Último Asalto</span></th>
                            <th colspan="6" style="border-bottom: 1px solid var(--border-color); padding-bottom: 10px; color: #d89614; font-size: 13px;">
                                <i class="fa-solid fa-robot"></i> Tabla de Estafermo
                            </th>
                        </tr>
                        <tr>
                            <th style="border-bottom: 2px solid var(--border-color); padding-top: 10px;"><i class="fa-solid fa-certificate elemento-icon" style="color: #a39eb5;"></i> Básico</th>
                            <th style="border-bottom: 2px solid var(--border-color); padding-top: 10px;"><i class="fa-regular fa-sun elemento-icon" style="color: #fdd843;"></i> Luz</th>
                            <th style="border-bottom: 2px solid var(--border-color); padding-top: 10px;"><i class="fa-solid fa-moon elemento-icon" style="color: #7b42f6;"></i> Osc.</th>
                            <th style="border-bottom: 2px solid var(--border-color); padding-top: 10px;"><i class="fa-solid fa-droplet elemento-icon" style="color: #4299f6;"></i> Agua</th>
                            <th style="border-bottom: 2px solid var(--border-color); padding-top: 10px;"><i class="fa-solid fa-fire elemento-icon" style="color: #f64242;"></i> Fuego</th>
                            <th style="border-bottom: 2px solid var(--border-color); padding-top: 10px;"><i class="fa-solid fa-leaf elemento-icon" style="color: #42f675;"></i> Tierra</th>
                        </tr>
                    </thead>
                    <tbody id="cuerpo-tabla">
                        <tr><td colspan="9" style="text-align:center;">Cargando datos desde Google Sheets...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/@widgetbot/crate@3" async defer>
        new Crate({ server: '1518747166494163045', channel: '1518747167261593632', color: '#292437', notifications: true })
    </script>

    <script>
        const cuerpoTabla = document.getElementById('cuerpo-tabla');
        
        // API NUEVA PARA RANKING
        const apiRankingURL = 'https://sheetdb.io/api/v1/byy514yadr0v0?sheet=Ranking';

        fetch(apiRankingURL)
            .then(response => response.json())
            .then(data => {
                cuerpoTabla.innerHTML = '';
                
                data.forEach(jugador => {
                    const claseDorada = parseInt(jugador.posicion) <= 5 ? 'top-5' : '';
                    const dañoAsalto = jugador.asalto ? jugador.asalto : '0';
                    
                    cuerpoTabla.innerHTML += `
                        <tr class="${claseDorada}">
                            <td><strong class="pos-numero">${jugador.posicion}</strong></td>
                            <td>
                                <div class="perfil-celda">
                                    <img src="${jugador.foto}" alt="${jugador.nombre}" class="foto-perfil" onerror="this.src='https://via.placeholder.com/36/3c354e/ffffff?text=?'">
                                    <span>${jugador.nombre}</span>
                                </div>
                            </td>
                            <td style="color: var(--accent-red); font-weight: 800; font-size: 16px;">${dañoAsalto}</td>
                            <td>${jugador.basico || '0'}</td>
                            <td>${jugador.luz || '0'}</td>
                            <td>${jugador.oscuridad || '0'}</td>
                            <td>${jugador.agua || '0'}</td>
                            <td>${jugador.fuego || '0'}</td>
                            <td>${jugador.tierra || '0'}</td>
                        </tr>
                    `;
                });
            })
            .catch(error => {
                console.error('Error al conectar con la hoja de cálculo:', error);
                cuerpoTabla.innerHTML = '<tr><td colspan="9">Error al cargar los datos del ranking. Verifica tu enlace de SheetDB.</td></tr>';
            });

        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('toggleSidebar');
        toggleBtn.addEventListener('click', () => { sidebar.classList.toggle('collapsed'); });

        const navTitles = document.querySelectorAll('.nav-title');
        navTitles.forEach(title => {
            title.addEventListener('click', () => {
                const group = title.closest('.nav-group');
                group.classList.toggle('collapsed-group');
            });
        });

        const themeBtn = document.getElementById('themeToggle');
        const rootElement = document.documentElement;

        if (localStorage.getItem('tema-casita') === 'dark') {
            rootElement.setAttribute('data-theme', 'dark');
            themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }

        themeBtn.addEventListener('click', () => {
            let isDark = rootElement.hasAttribute('data-theme');
            if (isDark) {
                rootElement.removeAttribute('data-theme');
                localStorage.setItem('tema-casita', 'light');
                themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            } else {
                rootElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('tema-casita', 'dark');
                themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            }
        });
    </script>
</body>
</html>
