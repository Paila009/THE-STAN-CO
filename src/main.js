import './styles.css';
import './header.css';
import './stage.css';
import './lookbook.css';
import { mountLookbook } from './lookbook.js';
import { mountShop } from './shop.js';
import { mountBrowse, mountOpening } from './stage.js';

mountOpening(document.querySelector('#top'));
mountBrowse(document.querySelector('#browse'));
mountLookbook();
mountShop({
  shop: document.querySelector('#shop'),
  dialog: document.querySelector('#shop-dialog'),
});

