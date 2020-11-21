export class Point {
    x: number = 0;
    y: number = 0;
}

export class GameScore {
    username!: string;
    score!: string;
}

export interface Truth {
    [key: string]: boolean;
};

export class DropInstance {
    landed: boolean = false;
    username: string = "unknown";
    location: Point;
    velocity: Point;
    element: HTMLElement | undefined;

    constructor() {
        this.location = new Point();
        this.velocity = new Point();
    }

    getLeft() : number {
        return this.location.x - this.element!.clientWidth / 2;
    }

    getRight() {
        return this.location.x + this.element!.clientWidth / 2;
    }

    getTop() {
        return this.location.y;
    }

    getBottom() {
        return this.location.y + this.element!.clientHeight;
    }

    getCenter() {
        return {
            x: this.location.x,
            y: (this.getTop() + this.getBottom()) / 2
        };
    }
};