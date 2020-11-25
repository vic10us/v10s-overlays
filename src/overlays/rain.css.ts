import { css } from "lit-element";

export const style = () => css`
    :host {
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        margin: 0;
        color: var(--white);
        overflow: hidden;
    }
    #context {
        margin: 0;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100%;
        position: absolute;
        /* background-color: black; */
        z-index: -1;
    };
    button {
        position: relative;
    }
`;