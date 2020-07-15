import fileSize from "filesize";
import mustache from 'mustache';
import $_fileInfo from '../views/file-info.hbs';
import Uri from "./utils/Uri";
import fsOperation from './fileSystem/fsOperation';
import Url from './utils/Url';
import dialogs from '../components/dialogs';

export default function showFileInfo() {
  const file = editorManager.activeFile;

  fsOperation(file.uri)
    .then(fs => {
      return fs.stats();
    })
    .then(stats => {
      let {
        lastModified,
        length,
        uri,
        type
      } = stats;
      length = fileSize(length);
      lastModified = new Date(lastModified).toLocaleString();


      const value = file.session.getValue();
      const protocol = Url.getProtocol(uri);
      const options = {
        name: file.name,
        lastModified,
        length,
        showUri: uri,
        shareUri: uri,
        type,
        lineCount: value.split(/\n+/).length,
        wordCount: value.split(/\s+|\n+/).length,
        lang: strings
      };

      if (protocol === "content:") {
        options.showUri = Uri.getVirtualAddress(file.uri);
        showBox(options);
      } else if (protocol === "ftp:") {
        options.showUri = Url.hidePassword(uri);
        options.shareUri = CACHE_STORAGE_REMOTE + uri.hashCode();
        showBox(options);
      } else {
        showBox(options);
      }
    });

  function showBox(options) {
    dialogs.box('', mustache.render($_fileInfo, options), true)
      .onclick(e => {
        const $target = e.target;
        if ($target instanceof HTMLElement) {
          const action = $target.getAttribute("action");
          const value = $target.getAttribute("value");

          if (action === "share") {
            system.shareFile(value, console.log, console.error);
          }
        }
      });
  }
}