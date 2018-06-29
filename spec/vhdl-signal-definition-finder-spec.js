'use babel';

import VhdlSignalDefinitionFinder from '../lib/vhdl-signal-definition-finder';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('VhdlSignalDefinitionFinder', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('vhdl-signal-definition-finder');
  });

  describe('when the vhdl-signal-definition-finder:show event is triggered', () => {
    it('hides and shows the modal panel', () => {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.vhdl-signal-definition-finder')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'vhdl-signal-definition-finder:show');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(workspaceElement.querySelector('.vhdl-signal-definition-finder')).toExist();

        let vhdlSignalDefinitionFinderElement = workspaceElement.querySelector('.vhdl-signal-definition-finder');
        expect(vhdlSignalDefinitionFinderElement).toExist();

        let vhdlSignalDefinitionFinderPanel = atom.workspace.panelForItem(vhdlSignalDefinitionFinderElement);
        expect(vhdlSignalDefinitionFinderPanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'vhdl-signal-definition-finder:show');
        expect(vhdlSignalDefinitionFinderPanel.isVisible()).toBe(false);
      });
    });

    it('hides and shows the view', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      expect(workspaceElement.querySelector('.vhdl-signal-definition-finder')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'vhdl-signal-definition-finder:show');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Now we can test for view visibility
        let vhdlSignalDefinitionFinderElement = workspaceElement.querySelector('.vhdl-signal-definition-finder');
        expect(vhdlSignalDefinitionFinderElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'vhdl-signal-definition-finder:show');
        expect(vhdlSignalDefinitionFinderElement).not.toBeVisible();
      });
    });
  });
});
