const branchesDiv = document.getElementById("branches");
const roomsDiv = document.getElementById("rooms");

loadSavedData();

function addBranch(data = {}) {
  const div = document.createElement("div");
  div.innerHTML = `
    <input placeholder="Branch Name" value="${data.name || ""}">
    <input placeholder="Start Roll" value="${data.start || ""}">
    <input placeholder="End Roll" value="${data.end || ""}">
    <button class="delete" onclick="this.parentElement.remove(); saveInputs()">🗑</button>
  `;
  branchesDiv.appendChild(div);
  saveInputs();
}

function addRoom(data = {}) {
  const div = document.createElement("div");
  div.innerHTML = `
    <input placeholder="Room Name" value="${data.name || ""}">
    <input type="number" placeholder="Rows" value="${data.rows || ""}">
    <input type="number" placeholder="Columns" value="${data.cols || ""}">
    <button class="delete" onclick="this.parentElement.remove(); saveInputs()">🗑</button>
  `;
  roomsDiv.appendChild(div);
  saveInputs();
}

function generateRolls(start, end) {
  const s = start.match(/(\D*)(\d+)/);
  const e = end.match(/(\D*)(\d+)/);
  const prefix = s[1];
  const from = parseInt(s[2]);
  const to = parseInt(e[2]);
  const width = s[2].length;

  const rolls = [];
  for (let i = from; i <= to; i++) {
    rolls.push(prefix + String(i).padStart(width, "0"));
  }
  return rolls;
}

function generateSeating() {
  saveInputs();

  const studentsPerBench =
    Number(document.getElementById("studentsPerBench").value);

  const branchInputs = branchesDiv.children;
  const roomInputs = roomsDiv.children;

  const branchQueues = {};
  const branchNames = [];

  for (const div of branchInputs) {
    const i = div.querySelectorAll("input");
    const branch = i[0].value.trim();
    const start = i[1].value.trim();
    const end = i[2].value.trim();
    if (!branch || !start || !end) continue;

    branchQueues[branch] = generateRolls(start, end)
      .map(r => `${branch}-${r}`);
    branchNames.push(branch);
  }

  let branchIndex = 0;
  const result = {};

  for (const div of roomInputs) {
    const i = div.querySelectorAll("input");
    const room = i[0].value;
    const rows = Number(i[1].value);
    const cols = Number(i[2].value);

    const columns = [];

    for (let c = 0; c < cols; c++) {
      const column = [];

      for (let r = 0; r < rows; r++) {
        const bench = [];
        const used = new Set();

        while (bench.length < studentsPerBench) {
          let attempts = 0;
          let placed = false;

          while (attempts < branchNames.length) {
            const b = branchNames[branchIndex++ % branchNames.length];
            if (branchQueues[b].length && !used.has(b)) {
              bench.push(branchQueues[b].shift());
              used.add(b);
              placed = true;
              break;
            }
            attempts++;
          }
          if (!placed) break;
        }

        column.push({
          label: String.fromCharCode(65 + c) + (r + 1),
          students: bench
        });
      }
      columns.push(column);
    }
    result[room] = columns;
  }

  localStorage.setItem("seatingData", JSON.stringify(result));
  window.location.href = "seating.html";
}

function saveInputs() {
  const data = {
    studentsPerBench: document.getElementById("studentsPerBench").value,
    branches: [...branchesDiv.children].map(d => {
      const i = d.querySelectorAll("input");
      return { name: i[0].value, start: i[1].value, end: i[2].value };
    }),
    rooms: [...roomsDiv.children].map(d => {
      const i = d.querySelectorAll("input");
      return { name: i[0].value, rows: i[1].value, cols: i[2].value };
    })
  };
  localStorage.setItem("inputData", JSON.stringify(data));
}

function loadSavedData() {
  const data = JSON.parse(localStorage.getItem("inputData"));
  if (!data) return;

  document.getElementById("studentsPerBench").value = data.studentsPerBench;
  data.branches.forEach(addBranch);
  data.rooms.forEach(addRoom);
}
