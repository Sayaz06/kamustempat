const STORAGE_KEY = "kamus_data";
let data = [];

function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    data = raw ? JSON.parse(raw) : [];
    render();
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function genId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2,5);
}

function render() {
    const div = document.getElementById("daftarPerkataan");
    div.innerHTML = "";
    data.forEach((p, idx) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h3 contenteditable="true" class="perkataanTitle">${p.perkataan}</h3>
            <button class="btnSecondary btnTambahElemen">+ Tambah Elemen</button>
            <button class="btnSecondary btnBuangPerkataan" style="background:#ef4444;">Buang Perkataan</button>
            <div class="elemenList"></div>
        `;
        card.querySelector(".perkataanTitle").onblur = e=>{
            p.perkataan = e.target.innerText.trim();
            saveData();
        };
        card.querySelector(".btnTambahElemen").onclick = () => {
            tambahElemen(p);
            render();
        };
        card.querySelector(".btnBuangPerkataan").onclick = () => {
            if(confirm("Buang perkataan ini?")) {
                data.splice(idx,1);
                saveData();
                render();
            }
        };
        const elHolder = card.querySelector(".elemenList");
        p.elemen.forEach((ele, eid) => {
            elHolder.appendChild(renderElemen(p, ele, eid));
        });
        div.appendChild(card);
    });
}

const senElemen = [
    "Ayat Biasa",
    "Ayat Dialog",
    "Karangan Biasa",
    "Syarahan",
    "Surat Rasmi",
    "Surat Tidak Rasmi",
    "Laporan",
    "Kesimpulan"
];

function tambahElemen(p) {
    const pilihan = prompt("Jenis elemen:\n" + senElemen.map((e,i)=>`${i+1}. ${e}`).join("\n"));
    const idx = parseInt(pilihan) -1;
    if(idx<0 || idx>=senElemen.length) return;
    const type = senElemen[idx];
    const ele = {
        id: genId(),
        type,
        content: (type==="Ayat Dialog") ? [] : "",
        watak: (type==="Ayat Dialog") ? [] : [],
        done: false
    };
    p.elemen.push(ele);
    saveData();
}

function renderElemen(p, ele, eid) {
    const div = document.createElement("div");
    div.className = "elemen";
    div.innerHTML = `
        <h4>${ele.type}</h4>
        <button class="smallBtn" style="background:#ef4444; color:white;" data-buangelemen>Buang Elemen</button>
        <label><input type="checkbox" class="elemenTick"> Sudah Dibaca / Dihafal</label>
        <div class="elemenContent"></div>
    `;
    div.querySelector("[data-buangelemen]").onclick = ()=>{
        if(confirm("Buang elemen ini?")) {
            const arr = p.elemen;
            arr.splice(eid,1);
            saveData();
            render();
        }
    };
    const chk = div.querySelector(".elemenTick");
    chk.checked = !!ele.done;
    chk.onchange = e=>{
        ele.done = e.target.checked;
        saveData();
    };
    const contentDiv = div.querySelector(".elemenContent");
    if(ele.type !== "Ayat Dialog") {
        const ta = document.createElement("textarea");
        ta.value = typeof ele.content === "string" ? ele.content : "";
        ta.oninput = ()=> {
            ele.content = ta.value;
            saveData();
        };
        contentDiv.appendChild(ta);
    } else {
        contentDiv.innerHTML = `
            <div style="display:flex; gap:6px; margin-bottom:6px;">
                <select class="watakSelect" style="flex:1; padding:6px;"></select>
                <button class="smallBtn btnTambahWatak">+ Watak</button>
            </div>
            <div class="chatBox" style="display:flex; flex-direction:column; gap:6px; background:#f7f7f7; padding:10px; border-radius:8px; min-height:80px;"></div>
            <div style="display:flex; gap:6px; margin-top:8px;">
                <input type="text" class="chatInput" placeholder="Tulis mesej…" style="flex:1; padding:8px;">
                <button class="btnPrimary btnHantar">Hantar</button>
            </div>
        `;
        const select = contentDiv.querySelector(".watakSelect");
        const chatBox = contentDiv.querySelector(".chatBox");
        const btnAddWatak = contentDiv.querySelector(".btnTambahWatak");
        const btnHantar = contentDiv.querySelector(".btnHantar");
        const input = contentDiv.querySelector(".chatInput");
        if(!Array.isArray(ele.watak)) ele.watak = [];
        function updateSelect() {
            select.innerHTML = "";
            ele.watak.forEach(w => {
                const o = document.createElement("option");
                o.value = w;
                o.textContent = w;
                select.appendChild(o);
            });
        }
        updateSelect();
        btnAddWatak.onclick = ()=> {
            const w = prompt("Nama watak:");
            if(!w) return;
            ele.watak.push(w);
            saveData();
            updateSelect();
        };
        chatBox.innerHTML = "";
        if(Array.isArray(ele.content)){
            ele.content.forEach(c=> {
                const b = document.createElement("div");
                b.className = (c.side==="left") ? "chatBubbleLeft" : "chatBubbleRight";
                b.contentEditable = true;
                b.dataset.index = ele.content.indexOf(c);
                const watakName = c.watak || "Aidil";      // <-- letak default Aidil kalau kosong
                b.innerText = `${watakName}: ${c.msg}`;
                b.oninput = ()=>{
                    const parts = b.innerText.split(": ");
                    c.watak = parts[0];
                    c.msg = parts[1] || "";
                    saveData();
                };
                chatBox.appendChild(b);
            });
        } else {
            ele.content = [];
        }
        btnHantar.onclick = ()=> {
            const msg = input.value.trim();
            if(!msg) return;
            const watak = select.value || ele.watak[0] || "Aidil";  // <-- default Aidi
            const side = (chatBox.children.length % 2 === 0) ? "left" : "right";
            const chat = { watak, msg, side };
            ele.content.push(chat);
            const b = document.createElement("div");
            b.className = side === "left" ? "chatBubbleLeft" : "chatBubbleRight";
            b.contentEditable = true;
            b.dataset.index = ele.content.indexOf(chat);
            b.innerText = `${watak}: ${msg}`;
            b.oninput = ()=>{
                const parts = b.innerText.split(": ");
                chat.watak = parts[0];
                chat.msg = parts[1] || "";
                saveData();
            };
            chatBox.appendChild(b);
            input.value = "";
            saveData();
        };
    }
    return div;
}

document.getElementById("btnTambahPerkataan").onclick = ()=>{
    const p = prompt("Masukkan perkataan:");
    if(!p) return;
    data.push({ id: genId(), perkataan: p, elemen: [] });
    saveData();
    render();
};

document.getElementById("btnExport").onclick = ()=> {
    const blob = new Blob([JSON.stringify(data,null,2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kamusTempat_export.json";
    // ← tukar nama fail export ikut bahasa baru
    a.click();
    URL.revokeObjectURL(url);
};

document.getElementById("btnImport").onclick = ()=> {
    document.getElementById("importFile").click();
};

document.getElementById("importFile").onchange = e => {
    const f = e.target.files[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = evt => {
        try {
            const d = JSON.parse(evt.target.result);
            if(Array.isArray(d)) {
                data = d;
                saveData();
                render();
                alert("Import berjaya");
            } else {
                alert("Format JSON salah");
            }
        } catch(err) {
            alert("Fail JSON tidak sah");
        }
    };
    r.readAsText(f);
};

/* Init */
loadData();