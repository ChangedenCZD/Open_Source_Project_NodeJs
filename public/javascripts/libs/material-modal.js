/**MD风格的对话框
 * 加入链式编程
 * */
((g, f) => {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = f() : typeof define === 'function' && define.amd ? define(f()) : g.Dialog = f();
})(this, function () {
    return () => {
        if (!document.getElementById('materialModal')) {
            var materialModal = document.createElement('div');
            materialModal.id = 'materialModal';
            materialModal.className = 'hide';
            materialModal.setAttribute('onclick', 'Dialog.close(event, false);');
            materialModal.innerHTML = '<style>@import url(/stylesheets/libs/material-modal.css);</style>';
            var materialModalCentered = document.createElement('div');
            materialModalCentered.id = 'materialModalCentered';
            var materialModalContent = document.createElement('div');
            materialModalContent.id = 'materialModalContent';
            materialModalContent.setAttribute('onclick', 'event.stopPropagation();');
            var materialModalTitle = document.createElement('div');
            materialModalTitle.id = 'materialModalTitle';
            var materialModalText = document.createElement('div');
            materialModalText.id = 'materialModalText';
            var materialModalButtons = document.createElement('div');
            materialModalButtons.id = 'materialModalButtons';
            var materialModalButtonOK = document.createElement('div');
            materialModalButtonOK.id = 'materialModalButtonOK';
            materialModalButtonOK.className = 'materialModalButton';
            materialModalButtonOK.setAttribute('onclick', 'Dialog.close(event, true);');
            materialModalButtonOK.innerHTML = 'OK'
            var materialModalButtonCANCEL = document.createElement('div');
            materialModalButtonCANCEL.id = 'materialModalButtonCANCEL';
            materialModalButtonCANCEL.className = 'materialModalButton';
            materialModalButtonCANCEL.setAttribute('onclick', 'Dialog.close(event, false);');
            materialModalButtonCANCEL.innerHTML = 'CANCEL';
            materialModalButtons.appendChild(materialModalButtonOK);
            materialModalButtons.appendChild(materialModalButtonCANCEL);
            materialModalContent.appendChild(materialModalTitle);
            materialModalContent.appendChild(materialModalText);
            materialModalContent.appendChild(materialModalButtons);
            materialModalCentered.appendChild(materialModalContent);
            materialModal.appendChild(materialModalCentered);
            document.body.appendChild(materialModal);
        }
        const g = this;
        return {
            materialCallback: null,
            alert: (title, text, callback) => {
                return g.Dialog.show(title, text, callback, false);
            },
            confirm: (title, text, callback) => {
                return g.Dialog.show(title, text, callback, true);
            },
            close: (e, result) => {
                e.stopPropagation();
                document.getElementById('materialModal').className = 'hide';
                if (typeof this.materialCallback == 'function') this.materialCallback(result);
                return g.Dialog;
            },
            setButtonsText: (left, right) => {
                g.Dialog.toggleLeftBtn(left ? true : false);
                if (left) {
                    document.getElementById('materialModalButtonCANCEL').innerText = left;
                }
                if (!right) {
                    right = '确认';
                }
                document.getElementById('materialModalButtonOK').innerText = right;
                return g.Dialog;
            },
            show: (title, text, callback, showCancelBtn = false) => {
                document.getElementById('materialModalTitle').innerHTML = title;
                document.getElementById('materialModalText').innerHTML = text;
                document.getElementById('materialModal').className = 'show';
                g.Dialog.toggleLeftBtn(showCancelBtn);
                this.materialCallback = callback;
                return g.Dialog;
            },
            toggleLeftBtn: (showCancelBtn) => {
                document.getElementById('materialModalButtonCANCEL').style.display = showCancelBtn ? 'block' : 'none';
                return g.Dialog;
            }
        }
    }
});