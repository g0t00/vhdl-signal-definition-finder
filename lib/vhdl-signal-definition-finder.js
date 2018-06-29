'use babel';

import VhdlSignalDefinitionFinderView from './vhdl-signal-definition-finder-view';
import {
  CompositeDisposable
} from 'atom';

export default {

  vhdlSignalDefinitionFinderView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.vhdlSignalDefinitionFinderView = new VhdlSignalDefinitionFinderView(state.vhdlSignalDefinitionFinderViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.vhdlSignalDefinitionFinderView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'vhdl-signal-definition-finder:show': () => this.show()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.vhdlSignalDefinitionFinderView.destroy();
  },

  serialize() {
    return {
      vhdlSignalDefinitionFinderViewState: this.vhdlSignalDefinitionFinderView.serialize()
    };
  },

  show() {
    let getWordAt = (s, pos) => {
      // make pos point to a character of the word
      while (s[pos] == " ") {
        pos--;
      }
      // find the space before that word
      // (add 1 to be at the begining of that word)
      // (note that it works even if there is no space before that word)
      pos = s.lastIndexOf(" ", pos) + 1;
      // find the end of the word
      var end = s.indexOf(" ", pos);
      if (end == -1) end = s.length; // set to length if it was the last word
      // return the result
      return s.substring(pos, end);
    };
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText();
      if (selection == '') {
        let cursorPosition = editor.getCursorBufferPosition();
        let lineText = editor.lineTextForBufferRow(cursorPosition.row);
        selection = getWordAt(lineText, cursorPosition.column);
      }
      let text = editor.getText();
      let re = new RegExp('^\\s+(signal|constant)\\s+' + selection + '\\s.*', 'mi')
      let matches = text.match(re);
      // console.log(matches);
      // console.log(re);
      if (matches) {
        atom.notifications.addInfo(matches[0]);
      }
    }
  }

};
