// Admin Panel JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  const lucide = window.lucide // Declare lucide variable
  if (typeof lucide !== "undefined") lucide.createIcons()

  // Admin App with localStorage data and simple login
  const ADMIN_CREDENTIALS = { username: "admin", password: "kidsco123" } // Declare ADMIN_CREDENTIALS variable
  const REG_KEY = "kidsco-registrations" // Declare REG_KEY variable
  const STUDENTS_KEY = "kidsco-students" // Declare STUDENTS_KEY variable

  bindLogin()
  if (isLoggedIn()) {
    showAdmin()
    initApp()
  } else {
    showLogin()
  }
})

// ---- Auth ----
function isLoggedIn() {
  return localStorage.getItem("admin-session") === "true"
}
function showLogin() {
  document.getElementById("login-screen").style.display = "flex"
  document.getElementById("admin-header").classList.add("hidden")
  document.getElementById("admin-app").classList.add("hidden")
}
function showAdmin() {
  document.getElementById("login-screen").style.display = "none"
  document.getElementById("admin-header").classList.remove("hidden")
  document.getElementById("admin-app").classList.remove("hidden")
  document.getElementById("admin-username").textContent = "Admin"
}
function bindLogin() {
  const form = document.getElementById("adminLoginForm")
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    const u = document.getElementById("adminUser").value.trim()
    const p = document.getElementById("adminPass").value
    if (u === ADMIN_CREDENTIALS.username && p === ADMIN_CREDENTIALS.password) {
      localStorage.setItem("admin-session", "true")
      showAdmin()
      initApp()
    } else {
      alert("Invalid credentials. Try admin / kidsco123")
    }
  })
  // Logout
  const logoutBtn = document.getElementById("logoutBtn")
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault()
    if (confirm("Logout?")) {
      localStorage.removeItem("admin-session")
      showLogin()
    }
  })
}

// ---- App Init ----
function initApp() {
  if (typeof window.lucide !== "undefined") window.lucide.createIcons() // Use window.lucide to avoid undeclared variable error
  initSidebarNavigation()
  renderAll()
  // Quick Action add student (demo: convert first pending)
  const qaAdd = document.getElementById("qa-add-student")
  if (qaAdd) qaAdd.addEventListener("click", approveFirstPending)

  // Filters
  bindAdmissionFilters()
  // Export
  const exportBtn = document.getElementById("export-students")
  if (exportBtn) exportBtn.addEventListener("click", exportStudentsCSV)
}

// Sidebar Navigation
function initSidebarNavigation() {
  const sidebarItems = document.querySelectorAll(".sidebar-item")

  sidebarItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()

      // Remove active class from all items
      sidebarItems.forEach((i) => i.classList.remove("active"))

      // Add active class to clicked item
      this.classList.add("active")

      // Get the target section
      const target = this.getAttribute("href").substring(1)
      showSection(target)
    })
  })
}

// Show different sections
function showSection(sectionName) {
  // Hide all content sections
  const sections = document.querySelectorAll('[id$="-content"]')
  sections.forEach((section) => {
    section.style.display = "none"
  })

  // Show the target section
  const targetSection = document.getElementById(sectionName + "-content")
  if (targetSection) {
    targetSection.style.display = "block"
  }
}

// ---- Data helpers ----
function getRegistrations() {
  try {
    return JSON.parse(localStorage.getItem(REG_KEY) || "[]")
  } catch {
    return []
  }
}
function setRegistrations(arr) {
  localStorage.setItem(REG_KEY, JSON.stringify(arr))
}
function getStudents() {
  try {
    return JSON.parse(localStorage.getItem(STUDENTS_KEY) || "[]")
  } catch {
    return []
  }
}
function setStudents(arr) {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(arr))
}

// ---- Rendering ----
function renderAll() {
  renderDashboard()
  renderStudents()
  renderAdmissions()
}

function renderDashboard() {
  const students = getStudents()
  const regs = getRegistrations()
  updateText("#total-students", students.length)
  updateText("#pending-applications", regs.filter((r) => r.status === "pending").length)
  // teachers static for now
}

function renderStudents() {
  const tbody = document.getElementById("students-table-body")
  if (!tbody) return
  const students = getStudents()
  tbody.innerHTML = ""
  if (!students.length) {
    tbody.innerHTML = `<tr><td class="p-3 text-gray-500" colspan="6">No students yet. Approve admissions to add students.</td></tr>`
    return
  }
  for (const s of students) {
    const tr = document.createElement("tr")
    tr.className = "border-b hover:bg-gray-50"
    tr.innerHTML = `
            <td class="p-3">${escapeHtml(s.childName)}</td>
            <td class="p-3">${escapeHtml(s.grade)}</td>
            <td class="p-3">${s.age ?? "-"}</td>
            <td class="p-3">${escapeHtml(s.parentName)}</td>
            <td class="p-3">${escapeHtml(s.parentPhone)}</td>
            <td class="p-3">${s.transportNeeded === "Yes" ? `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Yes</span>` : `<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">No</span>`}</td>
        `
    tbody.appendChild(tr)
  }
}

function renderAdmissions(filter = "all") {
  const list = document.getElementById("admissions-list")
  if (!list) return
  const regs = getRegistrations()
  list.innerHTML = ""
  const filtered = regs.filter((r) => (filter === "all" ? true : r.status === filter))
  if (!filtered.length) {
    list.innerHTML = `<div class="text-gray-500">No applications ${filter !== "all" ? `with status "${filter}"` : "yet"}.</div>`
    return
  }
  for (const r of filtered) {
    const card = document.createElement("div")
    card.className = "border rounded-lg p-4 hover:bg-gray-50 transition-colors"
    card.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <h4 class="font-semibold text-gray-900">${escapeHtml(r.childName)} <span class="text-sm text-gray-500">(${escapeHtml(r.grade)})</span></h4>
                    <p class="text-sm text-gray-600">Parent: ${escapeHtml(r.parentName)} • ${escapeHtml(r.parentPhone)}</p>
                    <p class="text-xs text-gray-500">Submitted: ${formatDate(r.submittedAt)}</p>
                    <p class="text-xs mt-1"><span class="px-2 py-0.5 rounded-full ${statusBadgeClass(r.status)}">${r.status}</span></p>
                </div>
                <div class="flex gap-2">
                    <button class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700" data-action="view" data-id="${r.id}">View</button>
                    <button class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700" data-action="approve" data-id="${r.id}">Approve</button>
                    <button class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700" data-action="reject" data-id="${r.id}">Reject</button>
                </div>
            </div>
            <div class="mt-3 hidden text-sm text-gray-700" id="detail-${r.id}">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div><span class="font-medium">Address:</span> ${escapeHtml(r.address || "—")}</div>
                    <div><span class="font-medium">DOB:</span> ${escapeHtml(r.childDOB || "—")}</div>
                    <div><span class="font-medium">Gender:</span> ${escapeHtml(r.childGender || "—")}</div>
                    <div><span class="font-medium">Transport:</span> ${escapeHtml(r.transportNeeded || "No")} ${r.transportArea ? `(${escapeHtml(r.transportArea)})` : ""}</div>
                    <div><span class="font-medium">Pickup Point:</span> ${escapeHtml(r.pickupPoint || "—")}</div>
                    <div><span class="font-medium">Uniform Size:</span> ${escapeHtml(r.uniformSize || "—")}</div>
                    <div class="md:col-span-2"><span class="font-medium">Medical:</span> ${escapeHtml(r.medicalInfo || "—")}</div>
                    <div class="md:col-span-2"><span class="font-medium">Notes:</span> ${escapeHtml(r.notes || "—")}</div>
                </div>
            </div>
        `
    list.appendChild(card)
  }
  // Actions
  list.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id")
      const action = btn.getAttribute("data-action")
      if (action === "view") toggleDetails(id)
      if (action === "approve") approveRegistration(id)
      if (action === "reject") rejectRegistration(id)
    })
  })
}

function statusBadgeClass(status) {
  if (status === "approved") return "bg-green-100 text-green-800"
  if (status === "rejected") return "bg-red-100 text-red-800"
  return "bg-yellow-100 text-yellow-800"
}
function toggleDetails(id) {
  const el = document.getElementById(`detail-${id}`)
  if (el) el.classList.toggle("hidden")
}

// ---- Actions ----
function approveRegistration(id) {
  const regs = getRegistrations()
  const idx = regs.findIndex((r) => r.id === id)
  if (idx === -1) return
  regs[idx].status = "approved"
  setRegistrations(regs)
  // Add to students if not exists
  const students = getStudents()
  if (!students.find((s) => s.id === id)) {
    const r = regs[idx]
    students.push({
      id,
      parentName: r.parentName,
      parentEmail: r.parentEmail,
      parentPhone: r.parentPhone,
      childName: r.childName,
      childDOB: r.childDOB,
      age: calcAge(r.childDOB),
      childGender: r.childGender,
      grade: r.grade,
      address: r.address,
      transportNeeded: r.transportNeeded,
      transportArea: r.transportArea,
      pickupPoint: r.pickupPoint,
      uniformSize: r.uniformSize,
    })
    setStudents(students)
  }
  renderAll()
}

function rejectRegistration(id) {
  const regs = getRegistrations()
  const idx = regs.findIndex((r) => r.id === id)
  if (idx === -1) return
  regs[idx].status = "rejected"
  setRegistrations(regs)
  renderAll()
}

function approveFirstPending() {
  const regs = getRegistrations()
  const pending = regs.find((r) => r.status === "pending")
  if (!pending) {
    alert("No pending applications.")
    return
  }
  approveRegistration(pending.id)
}

function bindAdmissionFilters() {
  const map = {
    "filter-all": "all",
    "filter-pending": "pending",
    "filter-approved": "approved",
    "filter-rejected": "rejected",
  }
  Object.keys(map).forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.addEventListener("click", () => renderAdmissions(map[id]))
  })
}

// ---- Utils ----
function updateText(sel, val) {
  const el = document.querySelector(sel)
  if (el) el.textContent = val
}
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso || ""
  }
}
function escapeHtml(str) {
  if (str == null) return ""
  return String(str).replace(
    /[&<>"']/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m],
  )
}
function calcAge(dob) {
  if (!dob) return null
  const birth = new Date(dob)
  if (isNaN(birth.getTime())) return null
  const diff = Date.now() - birth.getTime()
  const ageDt = new Date(diff)
  return Math.abs(ageDt.getUTCFullYear() - 1970)
}

function exportStudentsCSV() {
  const students = getStudents()
  if (!students.length) return alert("No students to export.")
  const headers = [
    "Child Name",
    "Grade",
    "Age",
    "Parent Name",
    "Parent Phone",
    "Parent Email",
    "Transport Needed",
    "Transport Area",
    "Pickup Point",
    "Uniform Size",
    "Address",
    "DOB",
  ]
  const rows = students.map((s) => [
    s.childName,
    s.grade,
    s.age ?? "",
    s.parentName,
    s.parentPhone,
    s.parentEmail || "",
    s.transportNeeded,
    s.transportArea || "",
    s.pickupPoint || "",
    s.uniformSize || "",
    s.address || "",
    s.childDOB || "",
  ])
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `kidsco-students-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
