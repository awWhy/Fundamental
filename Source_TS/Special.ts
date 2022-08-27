import { getId } from './Main(OnLoad)';

/*export const switchTheme = (theme = 1, initial = false) => {
    switch (theme) {
        case 1:
            break;
        case 2:
            break;
    }
};*/

export const Alert = (text: string) => {
    const blocker = getId('blocker');
    if (getId('blocker').style.display === 'block') {
        return;
    }

    getId('alertText').textContent = text;
    const confirm = getId('confirmBtn');

    blocker.style.display = 'block';
    const close = () => {
        blocker.style.display = 'none';
        confirm.removeEventListener('click', close);
    };
    confirm.addEventListener('click', close);
};

/* I have no idea how it works... I just did what was in comments: https://dev.to/ramonak/javascript-how-to-access-the-return-value-of-a-promise-object-1bck */
export const Confirm = async(text: string): Promise<boolean> => {
    return await new Promise((resolve) => {
        const blocker = getId('blocker');
        if (blocker.style.display === 'block') {
            resolve(false);
        }

        getId('alertText').textContent = text;
        const cancel = getId('cancelBtn');
        const confirm = getId('confirmBtn');

        blocker.style.display = 'block';
        cancel.style.display = 'block';
        const yes = async() => {
            blocker.style.display = 'none';
            cancel.style.display = 'none';
            confirm.removeEventListener('click', yes);
            cancel.removeEventListener('click', no);
            resolve(true);
        };
        const no = async() => {
            blocker.style.display = 'none';
            cancel.style.display = 'none';
            confirm.removeEventListener('click', yes);
            cancel.removeEventListener('click', no);
            resolve(false);
        };
        confirm.addEventListener('click', yes);
        cancel.addEventListener('click', no);
    });
};

export const Prompt = async(text: string): Promise<string | boolean> => {
    return await new Promise((resolve) => {
        const blocker = getId('blocker');
        if (blocker.style.display === 'block') {
            resolve(false);
        }

        getId('alertText').textContent = text;
        const input = getId('inputArea') as HTMLInputElement;
        let inputValue = '';
        const cancel = getId('cancelBtn');
        const confirm = getId('confirmBtn');

        blocker.style.display = 'block';
        cancel.style.display = 'block';
        input.style.display = 'block';
        const getValue = () => {
            inputValue = input.value;
        };
        const yes = async() => {
            blocker.style.display = 'none';
            cancel.style.display = 'none';
            input.style.display = 'none';
            confirm.removeEventListener('click', yes);
            cancel.removeEventListener('click', no);
            input.removeEventListener('blur', getValue);
            resolve(inputValue);
        };
        const no = async() => {
            blocker.style.display = 'none';
            cancel.style.display = 'none';
            input.style.display = 'none';
            confirm.removeEventListener('click', yes);
            cancel.removeEventListener('click', no);
            input.removeEventListener('blur', getValue);
            resolve(false);
        };
        confirm.addEventListener('click', yes);
        cancel.addEventListener('click', no);
        input.addEventListener('blur', getValue);
    });
};
