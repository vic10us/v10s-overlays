import { css } from "lit-element";

export const style = () => css`
    :host {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        margin: 0;
        color: var(--white);
        overflow: hidden;
        /* background: #000046;  /* fallback for old browsers */
        /* background: -webkit-linear-gradient(to top, #1CB5E0, #000046);  /* Chrome 10-25, Safari 5.1-6 */
        /* background: linear-gradient(to top, #1CB5E0, #000046); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
    }

    #3d-canvas {
        min-height: 100vh;
        width: 100%;
        margin: 0;
    }
`;