import { S as unlistenByKey, x as listenOnce, y as EventType_default } from "./util-Dd54OY8-.js";
import { f as IMAGE_DECODE } from "./dom-Bq2myMWu.js";
//#region node_modules/ol/ImageState.js
/**
* @module ol/ImageState
*/
/**
* @enum {number}
*/
var ImageState_default = {
	IDLE: 0,
	LOADING: 1,
	LOADED: 2,
	ERROR: 3,
	EMPTY: 4
};
//#endregion
//#region node_modules/ol/Image.js
/**
* @param {import('./DataTile.js').ImageLike} image Image element.
* @param {function():any} loadHandler Load callback function.
* @param {function():any} errorHandler Error callback function.
* @return {function():void} Callback to stop listening.
*/
function listenImage(image, loadHandler, errorHandler) {
	const img = image;
	let listening = true;
	let decoding = false;
	let loaded = false;
	const listenerKeys = [listenOnce(img, EventType_default.LOAD, function() {
		loaded = true;
		if (!decoding) loadHandler();
	})];
	if (img.src && IMAGE_DECODE) {
		decoding = true;
		img.decode().then(function() {
			if (listening) loadHandler();
		}).catch(function(error) {
			if (listening) if (loaded) loadHandler();
			else errorHandler();
		});
	} else listenerKeys.push(listenOnce(img, EventType_default.ERROR, errorHandler));
	return function unlisten() {
		listening = false;
		listenerKeys.forEach(unlistenByKey);
	};
}
/**
* Loads an image.
* @param {HTMLImageElement} image Image, not yet loaded.
* @param {string} [src] `src` attribute of the image. Optional, not required if already present.
* @return {Promise<HTMLImageElement>} Promise resolving to an `HTMLImageElement`.
* @api
*/
function load(image, src) {
	return new Promise((resolve, reject) => {
		function handleLoad() {
			unlisten();
			resolve(image);
		}
		function handleError() {
			unlisten();
			reject(/* @__PURE__ */ new Error("Image load error"));
		}
		function unlisten() {
			image.removeEventListener("load", handleLoad);
			image.removeEventListener("error", handleError);
		}
		image.addEventListener("load", handleLoad);
		image.addEventListener("error", handleError);
		if (src) image.src = src;
	});
}
/**
* @param {HTMLImageElement} image Image, not yet loaded.
* @param {string} [src] `src` attribute of the image. Optional, not required if already present.
* @return {Promise<HTMLImageElement>} Promise resolving to an `HTMLImageElement`.
*/
function decodeFallback(image, src) {
	if (src) image.src = src;
	return image.src && IMAGE_DECODE ? new Promise((resolve, reject) => image.decode().then(() => resolve(image)).catch((e) => image.complete && image.width ? resolve(image) : reject(e))) : load(image);
}
//#endregion
export { listenImage as n, ImageState_default as r, decodeFallback as t };

//# sourceMappingURL=Image-CYJjY4aE.js.map