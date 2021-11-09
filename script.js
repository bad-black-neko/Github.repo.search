const searchInput = document.querySelector('.searcher__input');
const searchList = document.querySelector('.searcher__list');
const repositoriesList = document.querySelector('.repositories');

function debounce(fn, delay) {
    let timer;
    return function(...arg) {
        const debounceFn = () => {
            fn.apply(this, arg)
        }
        clearTimeout(timer);
        timer = setTimeout(debounceFn, delay);
    }
}

function getRepositories(searchStr) {
    const url = new URL('https://api.github.com/search/repositories');
    url.searchParams.set('q', searchStr.trim());
    url.searchParams.set('sort', 'stars');
    url.searchParams.set('order', 'desc');
    url.searchParams.set('per_page', 5);

    fetch(url, {
        headers: { Accept: 'application/vnd.github.mercy-preview+json' }
    })
        .then(response => response.json())
        .then(({ items = [] }) => {
            renderSearchList(items)
        })
        .catch(() => clearSearchList)
}

function renderSearchList(list) {
    const fragment = document.createDocumentFragment();
    list.forEach(item => fragment.append(createSearchItem(item)))
    clearSearchList();
    searchList.append(fragment);
}

function clearSearchList() {
    [...searchList.childNodes].forEach(el => el.remove());
}

function createSearchItem({ name = '-', owner: { login: owner = '-' }, stargazers_count: stars = '-' }) {
    const item = document.createElement('li');
    item.classList.add('searcher__item');
    item.textContent = name;
    item.dataset.name = name;
    item.dataset.owner = owner;
    item.dataset.stars = stars;
    return item;
}

const searchInputChangeHandler = debounce(function() {
    this.value.length ? getRepositories(this.value) : clearSearchList();
}, 400);

function searchInputFocusHandler() {
    searchList.classList.add('searcher__list--open');
}

function searchInputBlurHandler(e) {
    setTimeout(() => {
        searchList.classList.remove('searcher__list--open')
    },200);
}

function searcherItemClickHandler(event) {
    searchInput.value = '';

    clearSearchList();

    const repository = createRepository(event.target.dataset);

    repositoriesList.prepend(repository);
}

function createRepository({ name, owner, stars }) {
    const item = document.createElement('li');
    item.classList.add('repositories__item');

    const info = document.createElement('div');
    info.classList.add('repositories__info');

    const repositoryName = document.createElement('p');
    repositoryName.classList.add('repositories__text');
    repositoryName.textContent = `Name: ${ name }`;

    const repositoryOwner = document.createElement('p');
    repositoryOwner.classList.add('repositories__text');
    repositoryOwner.textContent = `Owner: ${ owner }`;

    const repositoryStars = document.createElement('p');
    repositoryStars.classList.add('repositories__text');
    repositoryStars.textContent = `Stars: ${ stars }`;

    info.append(repositoryName, repositoryOwner, repositoryStars);

    const btn = document.createElement('button');
    btn.classList.add('btn-remove');

    item.append(info, btn);

    return item;
}

function repositoryBtnRemoveClickHandler(event) {
    event.target.closest('.repositories__item').remove();
}

document.addEventListener('DOMContentLoaded', () => {
    searchInput.addEventListener('input', searchInputChangeHandler);
    searchInput.addEventListener('focus', searchInputFocusHandler);
    searchInput.addEventListener('blur', searchInputBlurHandler);
    searchList.addEventListener('click', searcherItemClickHandler);
    repositoriesList.addEventListener('click', repositoryBtnRemoveClickHandler)
})