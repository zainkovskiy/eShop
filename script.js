const API = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';

class List {
    constructor(url, container, list = listContext) {
        this.container = container;
        this.list = list;
        this.url = url;
        this.goods = [];
        this.allProducts = [];
        this.filtered = [];
        this._init();
    }

    getJson(url) {
        return fetch(url ? url : `${API + this.url}`)
            .then(result => result.json())
            .catch(error => {
                console.log(error);
            })
    }

    handleData(data) {
        this.goods = [...data];
        this.render();
    }

    calcSum() {
        return this.allProducts.reduce((accum, item) => accum += item.price, 0);
    }

    render() {
        const block = document.querySelector(this.container);
        for (let product of this.goods) {
            // console.log(this.constructor.name);
            const productObj = new this.list[this.constructor.name](product);
            // console.log(productObj);
            this.allProducts.push(productObj);
            block.insertAdjacentHTML('beforeend', productObj.render());
        }
    }
    filter(value) {
        const regexp = new RegExp(value, 'i');
        this.filtered = this.allProducts.filter(product => regexp.test(product.product_name));
        this.allProducts.forEach(el => {
            const block = document.querySelector(`.product-item[data-id="${el.id_product}"]`);
            if (!this.filtered.includes(el)) {
                block.classList.add('invisible');
            } else {
                block.classList.remove('invisible');
            }
        })
    }
    _init() {
        return false;
    }
}

class Item {
    constructor(el, img = 'https://place-hold.it/200x150') {
        this.product_name = el.product_name;
        this.price = el.price;
        this.id_product = el.id_product;
        this.img = img;
    }
    render() {
        return `<div class="product-item" data-id="${this.id_product}">
                    <img src=${this.img} alt="Some img">
                    <div class="desk">
                        <h3>${this.product_name}</h3>
                        <p>${this.price} \u20bd</p>
                        <button class="buy-btn"
                        data-id="${this.id_product}"
                        data-name="${this.product_name}"
                        data-price="${this.price}">Купить</button>
                    </div>
                </div>`;
    }
}




class ProductsList extends List {
    constructor(cart, container = '.products', url = "/catalogData.json") {
        super(url, container);
        this.cart = cart;
        this.getJson()
            .then(data => this.handleData(data));
    }

    _init() {
        document.querySelector(this.container).addEventListener('click', e => {
            if (e.target.classList.contains('buy-btn')) {
                this.cart.addProduct(e.target);
            }
        });
        document.querySelector('.search-form').addEventListener('submit', e => {
            e.preventDefault();
            this.filter(document.querySelector('.search-field').value)
        })
    }
}

class ProductItem extends Item { }

class Cart extends List {
    constructor(container = ".cart-block", url = "/getBasket.json") {
        super(url, container);
        this.getJson()
            .then(data => {
                this.handleData(data.contents);
            });
    }

    addProduct(element) {
        this.getJson(`${API}/addToBasket.json`)
            .then(data => {
                if (data.result === 1) {
                    let productId = +element.dataset['id'];
                    let find = this.allProducts.find(product => product.id_product === productId);
                    if (find) {
                        find.quantity++;
                        this._updateCart(find);
                    } else {
                        let product = {
                            id_product: productId,
                            price: +element.dataset['price'],
                            product_name: element.dataset['name'],
                            quantity: 1
                        };
                        this.goods = [product];
                        this.render();
                    }
                } else {
                    alert('Error');
                }
            })
    }

    removeProduct(element) {
        this.getJson(`${API}/deleteFromBasket.json`)
            .then(data => {
                if (data.result === 1) {
                    let productId = +element.dataset['id'];
                    let find = this.allProducts.find(product => product.id_product === productId);
                    if (find.quantity > 1) {
                        find.quantity--;
                        this._updateCart(find);
                    } else {
                        this.allProducts.splice(this.allProducts.indexOf(find), 1);
                        document.querySelector(`.cart-item[data-id="${productId}"]`).remove();
                    }
                } else {
                    alert('error');
                }
            })
    }

    _updateCart(product) {
        let block = document.querySelector(`.cart-item[data-id="${product.id_product}"]`);
        block.querySelector('.product-quantity').textContent = `Количество: ${product.quantity}`;
        block.querySelector('.product-price').textContent = `${product.quantity * product.price}`;
    }

    _init() {
        document.querySelector('.btn-cart').addEventListener('click', () => {
            document.querySelector(this.container).classList.toggle('invisible');
        })
        document.querySelector(this.container).addEventListener('click', e => {
            if (e.target.classList.contains('del-btn')) {
                this.removeProduct(e.target);
            }
        })
    }

}

class CartItem extends Item {
    constructor(el, img = 'https://place-hold.it/50x50') {
        super(el, img);
        this.quantity = el.quantity;
    }
    render() {
        return `<div class="cart-item" data-id="${this.id_product}">
                <div class="product-bio">
                <img src=${this.img} alt="Some img">
                <div class="product-desc">
                <p class="product-title">${this.product_name}</p>
                <p class="product-quantity">Количество: ${this.quantity}</p>
                <p class="product-single-price">${this.price}</p>
                </div>
                </div>
                <div class="right-block"> 
                <p class="product-price">${this.quantity * this.price}</p>
                <button class="del-btn" data-id=${this.id_product}>X</button>
                </div>
                </div>`
    }
}

const listContext = {
    ProductsList: ProductItem,
    Cart: CartItem
};

let cart = new Cart();
let products = new ProductsList(cart);



class Form {
    constructor(form = '.form_send') {
        this.form = form;
        this.regExpName = /^[a-zA-Z]+$/;
        this.regExpTel = /^\+[7][\(]\d{3}[\)]\d{3}-\d{4}$/;
        this.regExpMail = /^[a-zA-Z]([a-zA-Z0-9_\-\.])+@mail.ru$/;
        this.formArr = [];
        this.setformArr();
        this._init();
    }
    setformArr() {
        this.formArr.push(document.querySelector('.name'));
        this.formArr.push(document.querySelector('.tel'));
        this.formArr.push(document.querySelector('.mail'));
    }
    _init() {
        document.querySelector(this.form).addEventListener('submit', e => {
            e.preventDefault();
            this.isValide();
        })
    }
    isValide() {
        for (let i = 0; i < this.formArr.length; i++) {
            if (this.formArr[i].name === 'name') {
                if (this.regExpName.test(this.formArr[i].value)) {
                    this.formArr[i].style.borderColor = "green";
                } else {
                    this.formArr[i].style.borderColor = "red";
                    alert('Введите имя латинскими буквами');
                }
            } else if (this.formArr[i].name === 'tel') {
                if (this.regExpTel.test(this.formArr[i].value)) {
                    this.formArr[i].style.borderColor = "green";
                } else {
                    this.formArr[i].style.borderColor = "red";
                    alert('Не соответствует формату +7(000)000-0000');
                }
            } else if (this.formArr[i].name === 'mail') {
                if (this.regExpMail.test(this.formArr[i].value)) {
                    this.formArr[i].style.borderColor = "green";
                } else {
                    this.formArr[i].style.borderColor = "red";
                    alert('Введите корректный email');
                }
            } else {
                return;
            }
        }
    }
}


const form = new Form();