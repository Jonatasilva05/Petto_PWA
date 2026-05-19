// ============================================================
// MAPA.JS — Dados em Tempo Real via OpenStreetMap (Overpass API)
// ============================================================

let map;
let markers = [];
let currentFilter = 'todos';
let userLat = -21.4045;
let userLng = -48.5050;
let userMarker = null;

// Raio de busca em metros (40km para pegar toda a região: Matão, Jaboticabal, etc)
const RAIO_BUSCA = 40000;

// Queries Overpass para cada categoria
const overpassQueries = {
    veterinaria: `
        node["amenity"="veterinary"](around:${RAIO_BUSCA},{LAT},{LNG});
        way["amenity"="veterinary"](around:${RAIO_BUSCA},{LAT},{LNG});
        node["shop"="pet"](around:${RAIO_BUSCA},{LAT},{LNG});
        way["shop"="pet"](around:${RAIO_BUSCA},{LAT},{LNG});
    `,
    petshop: `
        node["shop"="pet"](around:${RAIO_BUSCA},{LAT},{LNG});
        way["shop"="pet"](around:${RAIO_BUSCA},{LAT},{LNG});
        node["shop"="agrarian"](around:${RAIO_BUSCA},{LAT},{LNG});
        way["shop"="agrarian"](around:${RAIO_BUSCA},{LAT},{LNG});
    `,
    lazer: `
        node["leisure"="park"](around:${RAIO_BUSCA},{LAT},{LNG});
        way["leisure"="park"](around:${RAIO_BUSCA},{LAT},{LNG});
        node["leisure"="dog_park"](around:${RAIO_BUSCA},{LAT},{LNG});
        way["leisure"="dog_park"](around:${RAIO_BUSCA},{LAT},{LNG});
        node["leisure"="garden"](around:${RAIO_BUSCA},{LAT},{LNG});
        way["leisure"="garden"](around:${RAIO_BUSCA},{LAT},{LNG});
    `,
    todos: `
        node["amenity"="veterinary"](around:${RAIO_BUSCA},{LAT},{LNG});
        way["amenity"="veterinary"](around:${RAIO_BUSCA},{LAT},{LNG});
        node["shop"="pet"](around:${RAIO_BUSCA},{LAT},{LNG});
        way["shop"="pet"](around:${RAIO_BUSCA},{LAT},{LNG});
        node["shop"="agrarian"](around:${RAIO_BUSCA},{LAT},{LNG});
        way["shop"="agrarian"](around:${RAIO_BUSCA},{LAT},{LNG});
        node["leisure"="park"](around:${RAIO_BUSCA},{LAT},{LNG});
        way["leisure"="park"](around:${RAIO_BUSCA},{LAT},{LNG});
        node["leisure"="dog_park"](around:${RAIO_BUSCA},{LAT},{LNG});
        way["leisure"="dog_park"](around:${RAIO_BUSCA},{LAT},{LNG});
    `
};

// Ícones e cores por tipo
const tipoConfig = {
    veterinaria: { icone: 'fa-user-doctor', cor: '#e74c3c', label: 'Veterinária' },
    petshop:     { icone: 'fa-bone',        cor: '#3498db', label: 'Pet Shop'    },
    lazer:       { icone: 'fa-tree',        cor: '#27ae60', label: 'Parque/Lazer'},
    outros:      { icone: 'fa-paw',         cor: '#9b59b6', label: 'Outros'      }
};

// Detecta o tipo de um elemento OSM
function detectarTipo(tags) {
    if (!tags) return 'outros';
    if (tags.amenity === 'veterinary') return 'veterinaria';
    if (tags.shop === 'pet')           return 'petshop';
    if (tags.shop === 'agrarian')      return 'petshop';
    if (tags.leisure === 'dog_park')   return 'lazer';
    if (tags.leisure === 'park')       return 'lazer';
    if (tags.leisure === 'garden')     return 'lazer';
    return 'outros';
}

// Cria um ícone SVG colorido para o Leaflet
function criarIcone(tipo) {
    const cfg = tipoConfig[tipo] || tipoConfig.outros;
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
          <path d="M18 0 C8.06 0 0 8.06 0 18 C0 31.5 18 44 18 44 C18 44 36 31.5 36 18 C36 8.06 27.94 0 18 0Z"
                fill="${cfg.cor}" stroke="white" stroke-width="2"/>
          <circle cx="18" cy="18" r="10" fill="white" opacity="0.25"/>
        </svg>`;
    return L.divIcon({
        className: '',
        html: `<div style="position:relative;width:36px;height:44px;">
                 ${svg}
                 <i class="fa-solid ${cfg.icone}" style="
                    position:absolute;top:10px;left:50%;
                    transform:translateX(-50%);
                    color:white;font-size:13px;pointer-events:none;"></i>
               </div>`,
        iconSize:   [36, 44],
        iconAnchor: [18, 44],
        popupAnchor:[0, -44]
    });
}

// Mostra spinner de carregamento
function mostrarLoading(sim) {
    let el = document.getElementById('loading-overlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'loading-overlay';
        el.innerHTML = `
            <div style="
                position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                background:white;border-radius:12px;padding:20px 28px;
                display:flex;align-items:center;gap:12px;
                box-shadow:0 4px 20px rgba(0,0,0,0.15);z-index:9999;font-family:sans-serif;">
              <i class="fa-solid fa-spinner fa-spin" style="color:#e74c3c;font-size:20px;"></i>
              <span style="font-weight:600;color:#333;">Buscando em tempo real...</span>
            </div>`;
        el.style.cssText = 'position:absolute;inset:0;z-index:9999;pointer-events:none;';
        document.querySelector('.map-container').appendChild(el);
    }
    el.style.display = sim ? 'block' : 'none';
}

// Busca dados na Overpass API
async function buscarDadosOSM(lat, lng, filtro) {
    const query = (overpassQueries[filtro] || overpassQueries.todos)
        .replace(/{LAT}/g, lat)
        .replace(/{LNG}/g, lng);

    const body = `[out:json][timeout:25];(${query});out center;`;
    const url  = 'https://overpass-api.de/api/interpreter';

    const res  = await fetch(url, {
        method: 'POST',
        body:   'data=' + encodeURIComponent(body)
    });

    if (!res.ok) throw new Error('Erro na Overpass API: ' + res.status);
    return res.json();
}

// Converte elemento OSM → objeto local padronizado
function osmParaLocal(el) {
    const tags = el.tags || {};
    const lat  = el.lat ?? el.center?.lat;
    const lng  = el.lon ?? el.center?.lon;
    if (!lat || !lng) return null;

    const tipo    = detectarTipo(tags);
    const nome    = tags.name || tags['name:pt'] || 'Local sem nome';
    const rua     = tags['addr:street']  || '';
    const numero  = tags['addr:housenumber'] || '';
    const bairro  = tags['addr:suburb']  || tags['addr:neighbourhood'] || '';
    const endereco = [rua, numero, bairro].filter(Boolean).join(', ') || 'Endereço não disponível';
    const telefone = tags.phone || tags['contact:phone'] || tags['contact:whatsapp'] || '';
    const whatsapp = telefone.replace(/\D/g, '');
    const website  = tags.website || tags['contact:website'] || '';
    const horario  = tags.opening_hours || '';

    return { id: el.id, nome, tipo, lat, lng, endereco, whatsapp, website, horario,
             icone: tipoConfig[tipo]?.icone || 'fa-paw',
             cor:   tipoConfig[tipo]?.cor   || '#9b59b6',
             rating: null, osmId: el.id, osmType: el.type };
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Raio da Terra em metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Renderiza pinos no mapa (HÍBRIDO e OFFLINE-FIRST)
async function renderizarPinos(filtro) {
    currentFilter = filtro;
    mostrarLoading(true);
    document.getElementById('info-card').style.display = 'none';

    // Remove pinos antigos da tela
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    let locaisFinais = [];

    try {
        // ==========================================
        // PASSO 1: CARREGAR O BANCO DE DADOS LOCAL (Seu JSON)
        // Isso sempre roda, com ou sem internet.
        // ==========================================
        try {
            // CORREÇÃO AQUI: Mudamos de ../data para ./data
            const resJson = await fetch('./data/locais.json'); 
            
            if (resJson.ok) {
                const locaisBase = await resJson.json();
                
                // Filtra o JSON local se o usuário clicou em uma pílula específica
                locaisFinais = filtro === 'todos' 
                    ? locaisBase 
                    : locaisBase.filter(l => l.tipo === filtro);
            } else {
                console.warn("Erro HTTP ao carregar locais.json:", resJson.status);
            }
        } catch (e) {
            console.warn("Aviso: Falha ao carregar locais.json local. Verifique o caminho.", e);
        }

        // ==========================================
        // PASSO 2: CARREGAR DADOS EM TEMPO REAL (OSM)
        // Só roda se o celular tiver conexão com a internet.
        // ==========================================
        if (navigator.onLine) {
            try {
                const dataOSM = await buscarDadosOSM(userLat, userLng, filtro);
                const locaisOSM = dataOSM.elements
                    .map(osmParaLocal)
                    .filter(Boolean);

                // Mescla os dados em tempo real com o seu banco, evitando duplicatas
                locaisOSM.forEach(localOSM => {
                    const jaExiste = locaisFinais.some(localPremium => {
                        const mesmoNome = localOSM.nome.toLowerCase().includes(localPremium.nome.split(' ')[0].toLowerCase());
                        const muitoPerto = calcularDistancia(localOSM.lat, localOSM.lng, localPremium.lat, localPremium.lng) < 50;
                        return mesmoNome || muitoPerto;
                    });

                    // Se a API achou um local que não está no seu JSON, adicionamos ele
                    if (!jaExiste) {
                        if (filtro === 'todos' || localOSM.tipo === filtro) {
                            locaisFinais.push(localOSM);
                        }
                    }
                });
            } catch (apiError) {
                console.warn("A API de mapas falhou (timeout ou erro de rede).", apiError);
                mostrarToast('Instabilidade na rede. Mostrando apenas locais salvos no app.');
            }
        } else {
            // Celular está no Modo Avião ou sem 3G/4G/Wi-Fi
            mostrarToast('Você está offline. Mostrando apenas locais salvos no aplicativo.');
        }

        // ==========================================
        // PASSO 3: DESENHAR NO MAPA
        // ==========================================
        if (locaisFinais.length === 0) {
            mostrarToast('Nenhum local encontrado nessa área.');
        }

        locaisFinais.forEach(local => {
            const marker = L.marker([local.lat, local.lng], { icon: criarIcone(local.tipo) }).addTo(map);
            marker.on('click', () => abrirCardLocal(local));
            markers.push(marker);
        });

        atualizarContador(locaisFinais.length, filtro);

    } catch (err) {
        console.error("Erro geral na renderização:", err);
    } finally {
        mostrarLoading(false);
    }
}

// Atualiza badge de contagem
function atualizarContador(total, filtro) {
    let badge = document.getElementById('result-count');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'result-count';
        badge.style.cssText = `
            position:absolute;bottom:80px;left:50%;transform:translateX(-50%);
            background:rgba(0,0,0,0.7);color:white;
            padding:6px 14px;border-radius:20px;font-size:12px;
            font-weight:600;z-index:999;white-space:nowrap;
            font-family:sans-serif;pointer-events:none;`;
        document.querySelector('.map-container').appendChild(badge);
    }
    const label = filtro === 'todos' ? 'locais' : (tipoConfig[filtro]?.label || 'locais');
    badge.textContent = `${total} ${label} encontrados`;
    setTimeout(() => { if(badge) badge.style.opacity = '0'; }, 4000);
    badge.style.opacity = '1';
    badge.style.transition = 'opacity 0.5s';
}

// Abre card inferior com info do local
function abrirCardLocal(local) {
    const card = document.getElementById('info-card');
    document.getElementById('card-title').innerText   = local.nome;
    document.getElementById('card-address').innerText = local.endereco;
    document.getElementById('card-icon').innerHTML    = `<i class="fa-solid ${local.icone}" style="color:${local.cor}"></i>`;

    // Rating real ou N/A
    const ratingEl = document.getElementById('card-rating');
    if (local.rating) {
        ratingEl.innerText = local.rating;
    } else {
        ratingEl.innerText = 'OSM';
    }

    // Horário (se disponível)
    let extraInfo = document.getElementById('card-horario');
    if (!extraInfo) {
        extraInfo = document.createElement('div');
        extraInfo.id = 'card-horario';
        extraInfo.style.cssText = 'font-size:11px;color:#666;margin:4px 0 8px;font-family:sans-serif;';
        document.getElementById('card-address').after(extraInfo);
    }
    extraInfo.innerHTML = local.horario
        ? `<i class="fa-solid fa-clock" style="color:#e74c3c;"></i> ${local.horario}`
        : '';

    // WhatsApp
    const btnWa = document.getElementById('btn-wa');
    if (local.whatsapp && local.whatsapp.length >= 10) {
        btnWa.style.display = 'flex';
        btnWa.onclick = () => window.open(`https://wa.me/${local.whatsapp}`, '_blank');
    } else {
        btnWa.style.display = 'none';
    }

    // Website
    let btnWeb = document.getElementById('btn-web');
    if (!btnWeb) {
        btnWeb = document.createElement('div');
        btnWeb.id = 'btn-web';
        btnWeb.className = 'btn btn-gps';
        btnWeb.style.background = '#8e44ad';
        btnWeb.innerHTML = '<i class="fa-solid fa-globe"></i> Site';
        document.getElementById('btn-wa').after(btnWeb);
    }
    if (local.website) {
        btnWeb.style.display = 'flex';
        btnWeb.onclick = () => window.open(local.website, '_blank');
    } else {
        btnWeb.style.display = 'none';
    }

    // Rotas
    document.getElementById('btn-route').onclick = () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${local.lat},${local.lng}`, '_blank');
    };

    // Chat placeholder
    document.getElementById('btn-chat').onclick = () => {
        alert('Em breve! Uma nova funcionalidade está chegando...');
    };

    // Badge tipo
    let tipoBadge = document.getElementById('card-tipo-badge');
    if (!tipoBadge) {
        tipoBadge = document.createElement('div');
        tipoBadge.id = 'card-tipo-badge';
        tipoBadge.style.cssText = `
            display:inline-block;padding:2px 10px;border-radius:20px;
            font-size:10px;font-weight:700;color:white;margin-bottom:4px;
            font-family:sans-serif;letter-spacing:0.5px;text-transform:uppercase;`;
        document.getElementById('card-title').before(tipoBadge);
    }
    tipoBadge.textContent = tipoConfig[local.tipo]?.label || 'Local';
    tipoBadge.style.background = local.cor;

    card.style.display = 'block';
}

// Toast de notificação
function mostrarToast(msg) {
    let t = document.getElementById('toast-msg');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast-msg';
        t.style.cssText = `
            position:absolute;top:80px;left:50%;transform:translateX(-50%);
            background:rgba(0,0,0,0.8);color:white;padding:8px 16px;
            border-radius:8px;font-size:13px;font-family:sans-serif;
            z-index:9999;pointer-events:none;white-space:nowrap;`;
        document.querySelector('.map-container').appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.5s'; }, 3000);
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    map = L.map('map', { zoomControl: false }).setView([userLat, userLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Filtros
    const filters = document.querySelectorAll('.filter-pill');
    filters.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filters.forEach(f => f.classList.remove('active'));
            e.target.classList.add('active');
            renderizarPinos(e.target.getAttribute('data-tipo'));
        });
    });

    // Botão "Minha Localização"
    const btnLoc = document.getElementById('btn-my-location');
    if (btnLoc) {
        btnLoc.addEventListener('click', () => {
            if (!navigator.geolocation) {
                mostrarToast('Geolocalização não suportada.');
                return;
            }
            mostrarToast('Obtendo sua localização...');
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    userLat = pos.coords.latitude;
                    userLng = pos.coords.longitude;
                    map.setView([userLat, userLng], 14);

                    if (userMarker) map.removeLayer(userMarker);
                    userMarker = L.circleMarker([userLat, userLng], {
                        radius: 8, fillColor: '#3498db', color: 'white',
                        weight: 2, fillOpacity: 1
                    }).addTo(map).bindPopup('Você está aqui').openPopup();

                    renderizarPinos(currentFilter);
                },
                () => mostrarToast('Não foi possível obter sua localização.')
            );
        });
    }

    // Carga inicial
    renderizarPinos('todos');
});
