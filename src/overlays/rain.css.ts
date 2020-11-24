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
        background-color: black;
    }
    #context {
        margin: 0;
    };
`;