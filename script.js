let charts = {};
const gifs = ['imagenes/gato2.gif', 'imagenes/gato4.gif', 'imagenes/gato5.gif'];
const jpgs = ['imagenes/gato1.jpg', 'imagenes/gato3.jpg'];

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.textContent = isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
    }
}

function showLoading(callback, isError = false) {
    const overlay = document.getElementById('overlay');
    const gifImg = document.getElementById('overlay-gif');
    const title = document.querySelector('.overlay-content h3');
    const msgPara = document.getElementById('overlay-msg');
    
    if (overlay && gifImg) {
        gifImg.src = gifs[Math.floor(Math.random() * gifs.length)];
        
        if (title) {
            title.textContent = isError ? "Critical Error" : "Processing";
            title.style.backgroundColor = isError ? "#dc2626" : "#000080";
        }
        
        if (msgPara) {
            msgPara.textContent = isError ? "Se ha detectado un problema." : "Generando datos...";
        }
        
        overlay.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.add('hidden');
            if (callback) callback();
        }, 1500);
    } else if (callback) {
        callback();
    }
}

function updateSideImage() {
    const sideImg = document.getElementById('side-jpg');
    if (sideImg) {
        sideImg.src = jpgs[Math.floor(Math.random() * jpgs.length)];
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const bgMusic = document.getElementById('bg-music');
    const volumeControl = document.getElementById('volume-control');
    const muteBtn = document.getElementById('mute-btn');
    const themeToggle = document.getElementById('theme-toggle');

    // Toggle Settings Panel
    if (settingsBtn && settingsPanel) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsPanel.classList.toggle('hidden');
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
                settingsPanel.classList.add('hidden');
            }
        });
    }

    // Audio Controls
    if (bgMusic && volumeControl && muteBtn) {
        bgMusic.volume = volumeControl.value;

        volumeControl.addEventListener('input', () => {
            bgMusic.volume = volumeControl.value;
            if (bgMusic.volume > 0) {
                bgMusic.muted = false;
                muteBtn.textContent = '🔇 Silenciar';
            }
        });

        muteBtn.addEventListener('click', () => {
            bgMusic.muted = !bgMusic.muted;
            muteBtn.textContent = bgMusic.muted ? '🔊 Activar Sonido' : '🔇 Silenciar';
        });

        // Try to play music on first interaction (due to browser policies)
        const startMusic = () => {
            bgMusic.play().catch(() => {});
            document.removeEventListener('click', startMusic);
            document.removeEventListener('keydown', startMusic);
        };
        document.addEventListener('click', startMusic);
        document.addEventListener('keydown', startMusic);
    }

    // Initialize Dark Mode
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleDarkMode);
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = '☀️ Modo Claro';
        }
    }

    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Press Start 2P', cursive";
        Chart.defaults.font.size = 8;
    }
    
    updateSideImage();
    
    const btnGen = document.getElementById('btn-generate');
    if (btnGen) {
        btnGen.addEventListener('click', () => {
            showLoading(() => {
                document.getElementById('data-input').value = Array.from({length:20}, () => Math.floor(Math.random()*100)).join(', ');
                updateSideImage();
            });
        });
    }

    const btnCalc = document.getElementById('btn-calculate');
    if (btnCalc) {
        btnCalc.addEventListener('click', () => {
            const input = document.getElementById('data-input').value;
            const data = input.split(',').map(n => n.trim()).filter(n => n !== '').map(Number).filter(n => !isNaN(n));
            
            if (data.length < 20) {
                showLoading(() => {
                    const err = document.getElementById('error-msg');
                    if (err) err.textContent = `Error: Faltan datos (tienes ${data.length}, necesitas 20)`;
                }, true);
            } else {
                showLoading(calculateStatistics);
            }
        });
    }
});

function calculateStatistics() {
    const input = document.getElementById('data-input').value;
    const err = document.getElementById('error-msg');
    const res = document.getElementById('results-container');
    if (!err || !res) return;

    err.textContent = '';
    const data = input.split(',').map(n => n.trim()).filter(n => n !== '').map(Number).filter(n => !isNaN(n));
    
    res.classList.remove('hidden');
    data.sort((a,b) => a-b);
    
    const n = data.length, min = data[0], max = data[n-1], range = max-min;
    const median = n % 2 === 0 ? (data[n/2-1]+data[n/2])/2 : data[Math.floor(n/2)];
    const media = (data.reduce((a, b) => a + b, 0) / n).toFixed(2);
    
    const counts = {}; data.forEach(x => counts[x] = (counts[x] || 0) + 1);
    let maxF = 0, modes = [];
    for (let k in counts) { if (counts[k] > maxF) { maxF = counts[k]; modes = [k]; } else if (counts[k] === maxF) modes.push(k); }
    
    document.getElementById('stats-summary').innerHTML = `<ul style="list-style:none;padding:0;margin:0;font-size:12px">
        <li><b>Media:</b> ${media} | <b>Mediana:</b> ${median}</li>
        <li><b>Moda:</b> ${maxF>1 ? modes.join(',') : 'N/A'} (Frec: ${maxF})</li>
        <li><b>Máx:</b> ${max} | <b>Mín:</b> ${min} | <b>Rango:</b> ${range}</li>
    </ul>`;
    
    const tbody = document.querySelector('#freq-table tbody'); 
    tbody.innerHTML = '';
    const unique = Object.keys(counts).map(Number).sort((a,b) => a-b);
    let Fi = 0, labels = [], fiD = [], FiD = [];
    
    unique.forEach(v => {
        const fi = counts[v], fr = (fi/n).toFixed(3); Fi += fi;
        tbody.innerHTML += `<tr><td>${v}</td><td>${fi}</td><td>${fr}</td><td>${Fi}</td><td>${(Fi/n).toFixed(3)}</td></tr>`;
        labels.push(v); fiD.push(fi); FiD.push(Fi);
    });
    
    renderCharts(labels, fiD, FiD, n);
}

function renderCharts(labels, fiD, FiD, n) {
    Object.values(charts).forEach(c => c.destroy());
    
    charts.hp = new Chart(document.getElementById('chart-hist-poly'), {
        data: { labels, datasets: [{type:'bar',label:'fi',data:fiD,backgroundColor:'#3b82f6'},{type:'line',label:'Polígono',data:fiD,borderColor:'#1e3a8a'}] },
        options: { responsive:true, maintainAspectRatio:false }
    });
    
    charts.oj = new Chart(document.getElementById('chart-ojiva'), {
        type: 'line', data: { labels, datasets: [{label:'Fi',data:FiD,borderColor:'#10b981',fill:true}] },
        options: { responsive:true, maintainAspectRatio:false }
    });
    
    const sD = labels.map((l,i) => ({l,v:fiD[i]})).sort((a,b) => b.v-a.v);
    let cM = 0; 
    const pL = sD.map(d=>d.l), pF = sD.map(d=>d.v), pA = sD.map(d=>{cM+=d.v; return (cM/n*100).toFixed(1)});
    
    charts.pa = new Chart(document.getElementById('chart-pareto'), {
        data: { labels:pL, datasets: [{type:'bar',label:'fi',data:pF,backgroundColor:'#3b82f6'},{type:'line',label:'%',data:pA,borderColor:'#f59e0b',yAxisID:'y1'}] },
        options: { responsive:true, maintainAspectRatio:false, scales:{ y1:{position:'right',max:100, min:0} } }
    });
}

function randomizeSets() {
    showLoading(() => {
        const r = () => Array.from({length:5}, () => Math.floor(Math.random()*20)).join(',');
        document.getElementById('set-a').value = r(); 
        document.getElementById('set-b').value = r();
        updateSideImage();
    });
}

function triggerCalculateSets() {
    const valA = document.getElementById('set-a').value;
    const valB = document.getElementById('set-b').value;
    
    if (!valA || !valB) {
        showLoading(() => {
            document.getElementById('sets-results').innerHTML = '<span class="error">Error: Ambos conjuntos deben tener datos</span>';
        }, true);
    } else {
        showLoading(calculateSets);
    }
}

function calculateSets() {
    const g = (id) => new Set(document.getElementById(id).value.split(',').map(s=>s.trim()).filter(s=>s!==''));
    const A = g('set-a'), B = g('set-b');
    const u = new Set([...A, ...B]);
    const i = new Set([...A].filter(x => B.has(x)));
    const dAB = new Set([...A].filter(x => !B.has(x)));
    const dBA = new Set([...B].filter(x => !A.has(x)));
    
    document.getElementById('sets-results').innerHTML = `
        A∪B: {${[...u].join(',')}}<br>
        A∩B: {${[...i].join(',') || '∅'}}<br>
        A-B: {${[...dAB].join(',') || '∅'}}<br>
        B-A: {${[...dBA].join(',') || '∅'}}`;
}

function fact(n) { return n <= 1 ? 1 : n * fact(n-1); }

function randomizeComb() {
    showLoading(() => {
        const n = Math.floor(Math.random()*10)+5;
        document.getElementById('comb-n').value = n; 
        document.getElementById('comb-r').value = Math.floor(Math.random()*n);
        updateSideImage();
    });
}

function triggerCalculateCombinatorics() {
    const n = +document.getElementById('comb-n').value;
    const r = +document.getElementById('comb-r').value;
    
    if (n < r || n < 0 || r < 0) {
        showLoading(() => {
            document.getElementById('comb-results').innerHTML = '<span class="error">Error: n < r o valores negativos</span>';
        }, true);
    } else {
        showLoading(calculateCombinatorics);
    }
}

function calculateCombinatorics() {
    const n = +document.getElementById('comb-n').value, r = +document.getElementById('comb-r').value;
    const p = fact(n)/fact(n-r), c = p/fact(r);
    document.getElementById('comb-results').innerHTML = `P(n,r): ${p.toLocaleString()}<br>C(n,r): ${c.toLocaleString()}`;
}

function randomizeMult() { 
    showLoading(() => {
        document.getElementById('mult-input').value = Array.from({length:3}, () => Math.floor(Math.random()*3)+2).join(',');
        updateSideImage();
    });
}

function triggerCalculateMultiplicative() {
    const val = document.getElementById('mult-input').value;
    if (!val) {
        showLoading(() => {
            document.getElementById('mult-results').innerHTML = '<span class="error">Error: Ingrese valores numéricos</span>';
        }, true);
    } else {
        showLoading(calculateMultiplicative);
    }
}

function calculateMultiplicative() {
    const s = document.getElementById('mult-input').value.split(',').map(Number).filter(n=>!isNaN(n));
    if (!s.length) return;
    document.getElementById('mult-results').innerHTML = `Total: ${s.reduce((a,b)=>a*b,1).toLocaleString()} (${s.join('×')})`;
    renderTree(s);
}

function renderTree(s) {
    const res = document.getElementById('tree-diagram');
    if (!res) return;
    if (s.reduce((a,b)=>a*b,1) > 100) { res.innerHTML = 'Árbol demasiado grande (>100 resultados)'; return; }
    let o = "Raíz\n";
    function b(l, p) {
        if (l === s.length) return;
        for (let i=1; i<=s[l]; i++) {
            const last = i===s[l]; 
            o += p + (last ? "└── " : "├── ") + `Etapa ${l+1} Op ${i}\n`;
            b(l+1, p + (last ? "    " : "│   "));
        }
    }
    b(0, ""); res.textContent = o;
}
