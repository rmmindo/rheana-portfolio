// models.js
// Loads a model into the visitor's browser, once, and only when asked.
//
// Two rules govern everything here.
//
// Nothing downloads until someone presses a button. These weights are 23 MB and
// 68 MB. A visitor who scrolls past a playground must pay nothing for it, which
// is the same reason the video is behind a poster and a press.
//
// The visitor's own text never leaves the tab. The model comes to the data.
// That is not a privacy flourish bolted onto a demo - it is the argument the
// Azeus chatbot was built on, where the whole point was that company data
// stayed on company machines. Running it in the browser is the same claim,
// made where you can check it: open the network tab and watch nothing leave.

const CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2';

let libraryPromise = null;
const pipelines = new Map();

async function library() {
  if (!libraryPromise) {
    // A full URL, so Vite leaves it alone and the browser fetches it at the
    // moment of the press rather than bundling it into the page.
    libraryPromise = import(/* @vite-ignore */ `${CDN}/dist/transformers.min.js`);
  }
  return libraryPromise;
}

/**
 * Returns a ready pipeline, loading it on first use.
 *
 * onProgress receives a 0-100 number. Model loading is slow enough that a bar
 * is not decoration: without one, a 68 MB download is indistinguishable from a
 * page that has frozen.
 */
export function loadPipeline(task, model, onProgress) {
  const key = `${task}:${model}`;
  if (!pipelines.has(key)) {
    const p = library()
      .then(({ pipeline, env }) => {
        // No local model directory to look in; everything comes from the CDN.
        env.allowLocalModels = false;
        return pipeline(task, model, {
          dtype: 'q8',
          progress_callback: info => {
            if (info?.status === 'progress' && info.total) {
              onProgress?.(Math.round((info.loaded / info.total) * 100));
            }
          },
        });
      })
      .catch(err => {
        // A failed load must not poison the cache, or pressing the button a
        // second time would return the same rejection for ever.
        pipelines.delete(key);
        throw err;
      });
    pipelines.set(key, p);
  }
  return pipelines.get(key);
}

export const EMBED_MODEL = 'Xenova/all-MiniLM-L6-v2';
export const MASK_MODEL = 'Xenova/distilbert-base-uncased';
