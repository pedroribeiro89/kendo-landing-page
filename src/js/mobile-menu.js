const mobileMenu = document.querySelector('#mobile-menu');
const mobileMenuBtn = document.querySelector('#mobile-btn');
const closeMobileMenuBtn = document.querySelector('#close-mobile-btn');

const openMenu = () => {
    mobileMenu.classList.remove('slide-out');
    mobileMenu.classList.toggle('slide-in');
    mobileMenu.classList.remove('hidden');
    mobileMenuBtn.classList.toggle('hidden');
};

const closeMenu = () => {
    mobileMenu.classList.remove('slide-in');
    mobileMenu.classList.toggle('slide-out');
    setTimeout(() => { mobileMenu.classList.add('hidden'); }, 1000);
    mobileMenuBtn.classList.remove('hidden');
};

mobileMenuBtn.addEventListener('click', openMenu);
closeMobileMenuBtn.addEventListener('click', closeMenu);

const mobileNavItens = document.querySelectorAll('.mobile-nav-list>a');
mobileNavItens.forEach(item => { item.addEventListener('click', closeMenu); })

window.addEventListener("resize", () => {
    if (window.innerWidth > 640) {
        mobileMenu.classList.remove('slide-in');
        mobileMenu.classList.add('hidden');
    } else {
        mobileMenuBtn.classList.remove('hidden');
    }
});