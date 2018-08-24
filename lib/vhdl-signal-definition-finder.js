'use babel';

import VhdlSignalDefinitionFinderView from './vhdl-signal-definition-finder-view';
import {
  CompositeDisposable, Point
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
      'vhdl-signal-definition-finder:show': () => this.show(),
      'vhdl-signal-definition-finder:jump': () => this.jump(),
      'vhdl-signal-definition-finder:check-reset': () => this.checkReset()
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

  findSignalAtCursor() {
    let getWordAt = (s, pos) => {
      // make pos point to a character of the word
      while (s[pos].match(/\s/) === null) {
        pos--;
      }
      // find the space before that word
      // (add 1 to be at the begining of that word)
      // (note that it works even if there is no space before that word)
      pos = s.lastIndexOf(" ", pos) + 1;
      // find the end of the word
      var end = s.indexOf(" ", pos);
      if (s.indexOf("(", pos) < end) {
        end = s.indexOf("(", pos);
      }
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
      return matches;
      if (matches) {
        atom.notifications.addInfo(matches[0]);
      }
    } else {
      return null;
    }

    // console.log(matches);
    // console.log(re);
    return matches;

  },
  show() {
    // console.log(this);
    let matches = this.findSignalAtCursor();
    if (matches) {
      atom.notifications.addInfo(matches[0]);
    }
  },
  jump() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let matches = this.findSignalAtCursor();
      if (matches) {
        let textPart = editor.getText().substring(0, matches.index);
        let row = textPart.split("\n").length - 1;
        const position = new Point(row, 0);
        console.log(row);
        editor.setCursorBufferPosition(position);
        editor.unfoldBufferRow(row);
        editor.moveToFirstCharacterOfLine();
        editor.scrollToBufferPosition(position, {
          center: true
        });
      }
    }
  },
  checkReset() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let text = editor.getText();
      console.log(typeof text, text.length);
      const re = /^\s+signal\s+(r_\S+)/mgi;
      let registers = [];
      while (m = re.exec(text)) {
        registers.push(m[1]);
      }
      let resetBlocks = [];
      const reResetBlock = /if i_reset[^\n]*then\s*\n([\s\S]*?)\n\s*(?:els|end)/gim
      while (m = reResetBlock.exec(text)) {
        resetBlocks.push(m[1]);
      }
      console.log(registers, resetBlocks, 'found');
      let missedRegisters = registers.filter(register => {
        return resetBlocks.reduce((acc, resetBlock) => {
          if (acc === false) {
            return false;
          }
          return resetBlock.toLowerCase().search(register.toLowerCase()) === -1;
        }, true);
      });
      if (missedRegisters.length > 0) {
        console.log("\x1b[31m", missedRegisters, 'missing reset');
        atom.notifications.addError('following resets missing: <br>' + missedRegisters.join('<br>'));
      } else {
        atom.notifications.addSuccess('no registers missing reset');
      }
    }
  }

};
