import { scrolls } from "./scroll.js";
import {lerp} from "./math.js";

const root  = document.documentElement;
const header  = document.querySelector(".header-container");

document.addEventListener('DOMContentLoaded', () => {
    // 跳转
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            moveTo(targetElement);
        });
    });
});

function moveTo(targetElement) {
    if (targetElement) {
        window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
        });
    }
}

scrolls.addThreshold( (scrollY) => scrollY > 100, (passes) => {
    console.log(passes)
    if (passes) {
        header.style.borderRadius = "2.5rem";
        header.style.margin = "1rem 1rem";
    } else {
        header.style.borderRadius = "0rem";
        header.style.margin = "0 0";
    }
})