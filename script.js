// Shared UI interactions for all pages

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu()
  initSmoothScrolling() // still works on pages with anchors
  initContactForm()
  initScrollAnimations()
  initHeaderScroll()
  initInteractiveElements()

  // Init lucide icons
  const lucide = window.lucide // Declare the lucide variable
  if (typeof lucide !== "undefined") {
    lucide.createIcons()
  }

  // Hero buttons: navigate to pages
  document.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const to = btn.getAttribute("data-go")
      if (to) window.location.href = to
    })
  })
})

// Mobile Menu
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const mobileMenu = document.getElementById("mobileMenu")
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link")
  if (!mobileMenuBtn || !mobileMenu) return

  let isMenuOpen = false
  mobileMenuBtn.addEventListener("click", () => {
    isMenuOpen = !isMenuOpen
    if (isMenuOpen) {
      mobileMenu.style.display = "block"
      setTimeout(() => {
        mobileMenu.style.opacity = "1"
        mobileMenu.style.transform = "translateY(0)"
      }, 10)
    } else {
      mobileMenu.style.opacity = "0"
      mobileMenu.style.transform = "translateY(-10px)"
      setTimeout(() => (mobileMenu.style.display = "none"), 300)
    }
  })
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      isMenuOpen = false
      mobileMenu.style.opacity = "0"
      mobileMenu.style.transform = "translateY(-10px)"
      setTimeout(() => (mobileMenu.style.display = "none"), 300)
    })
  })
  mobileMenu.style.opacity = "0"
  mobileMenu.style.transform = "translateY(-10px)"
  mobileMenu.style.transition = "all 0.3s ease"
}

// Smooth Scrolling for in-page anchors
function initSmoothScrolling() {
  const navLinks = document.querySelectorAll('a[href^="#"]')
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href")
      if (targetId.length > 1) {
        e.preventDefault()
        const target = document.querySelector(targetId)
        if (!target) return
        const header = document.querySelector(".header")
        const offset = (header ? header.offsetHeight : 0) + 20
        window.scrollTo({ top: target.offsetTop - offset, behavior: "smooth" })
      }
    })
  })
}

// Contact Form
function initContactForm() {
  const contactForm = document.getElementById("contactForm")
  if (!contactForm) return
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const fd = new FormData(contactForm)
    const obj = {}
    fd.forEach((v, k) => (obj[k] = v))
    if (!obj.name || !obj.email || !obj.message || obj.message.length < 5) {
      showNotification("Please complete the form with a valid message (min 5 chars).", "error")
      return
    }
    const btn = contactForm.querySelector('button[type="submit"]')
    const txt = btn.textContent
    btn.textContent = "Sending..."
    btn.disabled = true
    setTimeout(() => {
      btn.textContent = txt
      btn.disabled = false
      contactForm.reset()
      showNotification("Message sent successfully! We will be in touch.", "success")
    }, 1200)
  })
}

// Notification
function showNotification(message, type = "info") {
  const n = document.createElement("div")
  n.className = "notification"
  n.style.cssText = `
    position: fixed; top: 100px; right: 20px; background: ${
      type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"
    }; color: white; padding: 1rem 1.25rem; border-radius: 10px; z-index: 10000;
    box-shadow: 0 10px 25px rgba(0,0,0,.2); transform: translateX(100%); transition: transform .3s ease;
    max-width: 360px; font-weight: 600; white-space: pre-line;
  `
  n.textContent = message
  document.body.appendChild(n)
  requestAnimationFrame(() => (n.style.transform = "translateX(0)"))
  setTimeout(() => {
    n.style.transform = "translateX(100%)"
    setTimeout(() => n.remove(), 300)
  }, 4000)
}

// Scroll Animations
function initScrollAnimations() {
  if (!("IntersectionObserver" in window)) return
  const obs = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  )
  document.querySelectorAll(".card, .testimonial, .program-card, .step, .info-card").forEach((el) => {
    el.classList.add("fade-in")
    obs.observe(el)
  })
}

// Header effect
function initHeaderScroll() {
  const header = document.querySelector(".header")
  if (!header) return
  window.addEventListener("scroll", () => {
    const st = window.pageYOffset || document.documentElement.scrollTop
    if (st > 100) {
      header.style.background = "rgba(255, 255, 255, 0.95)"
      header.style.backdropFilter = "blur(10px)"
    } else {
      header.style.background = ""
      header.style.backdropFilter = "none"
    }
  })
}

// Interactive
function initInteractiveElements() {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)"
    })
    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)"
    })
  })
}
