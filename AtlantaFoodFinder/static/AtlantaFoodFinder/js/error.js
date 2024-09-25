const display = document.getElementById('messages');

class ErrorDisplay {
    constructor(message) {
        this.element = document.getElementById('errorTemplate').cloneNode(true);
        this.element.removeAttribute('id');
        this.element.classList.remove('hidden');
        this.element.getElementsByTagName('span').item(0).innerHTML = message;
        this.element.getElementsByTagName('button').item(0).addEventListener('click', this.out.bind(this));

        this.timeout = null;
    }

    in() {
        display.appendChild(this.element);

        gsap.from(this.element, {
            opacity: 0,
            y: 25,
            scale: 0.8,
            ease: 'power2.out',
            onComplete: () => {
                this.timeout = setTimeout(this.out.bind(this), 5000);
            },
            callbackScope: this
        });
    }

    out() {
        clearTimeout(this.timeout);
        gsap.to(this.element, {
            opacity: 0,
            y: 25,
            scale: 0.8,
            height: 0,
            ease: 'power2.in',
            onComplete: () => display.removeChild(this.element),
            callbackScope: this
        });
    }
}

function displayError(message) {
    const error = new ErrorDisplay(message);
    error.in();
}