import './styles.css';
import './header.css';
import './stage.css';
import './premiere-fashion.css';
import './cinema.css';
import { mountCinema } from './cinema.js';
import { mountShop } from './shop.js';
import { mountBrowse, mountOpening } from './stage.js';
import { mountChapters } from './chapters.js';

mountOpening(document.querySelector('#top'));
mountBrowse(document.querySelector('#browse'));
mountChapters(document.querySelector('#actor-chapters'));
mountCinema(document.querySelector('#cinema'));
mountShop({
  shop: document.querySelector('#shop'),
  dialog: document.querySelector('#shop-dialog'),
});

