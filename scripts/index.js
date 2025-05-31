import { scrolls } from "./scroll.js";

const background = document.getElementById("background");

// 窗口大小变化事件
window.addEventListener('resize', function() {
  console.log('窗口大小已调整：', window.innerWidth, 'x', window.innerHeight);
});

document.addEventListener("mousemove", (e) => {
  const x = (window.innerWidth / 2 - e.pageX) / 25;
  const y = (window.innerHeight / 2 - e.pageY) / 25;

  background.style.transform = `translate(${x}px, ${y}px)`;
})

const home = document.getElementById("home");
const root  = document.documentElement;
const startColor = `#ffffff00`;
const endColor = `#ffffffb0`;

function mixRGBA(color1, color2, delta) {
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);
  const a1 = parseInt(color1.substring(7, 9), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);
  const a2 = parseInt(color2.substring(7, 9), 16);

  const r = Math.round(r1 + (r2 - r1) * delta);
  const g = Math.round(g1 + (g2 - g1) * delta);
  const b = Math.round(b1 + (b2 - b1) * delta);
  const a = Math.round(a1 + (a2 - a1) * delta);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${a.toString(16).padStart(2, '0')}`
}

const regx_email = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

function submitForm(contactForm) {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  if (name && email && message) {
    alert('感谢您的留言！我会尽快回复您。');
    contactForm.reset();
  } else {
    if (!regx_email.test(email)) {
      alert('请填写正确的邮箱地址。');
    } else {
      alert('请填写所有必填字段。');
    }
  }
}

scrolls.addListener(20, 500, (progress) => {
  const color = mixRGBA( startColor, endColor, progress);
  root.style.setProperty('--home-background-color', color);

  if (progress < 1e-6) {
    root.style.setProperty("--home-background-blur", `none`);
  } else {
    root.style.setProperty("--home-background-blur", `blur(${progress * 10}px)`);
  }
})