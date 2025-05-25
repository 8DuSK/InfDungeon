// Custom data type for keeping track of counting values

export class CountValue {

    constructor(max, count, direction = -1, overFlow = false) {

        this.max = max;
        this.count = count;
        this.overFlow = overFlow;

        this.direction = direction;
    }

    // Adds certain value to count
    increment(value) {

        this.count += (value*this.direction);

        if (this.count <= 0 && this.direction == -1) {
            if (!this.overFlow) this.count = 0;
            return true;

        } else if (this.count >= this.max && this.direction == 1) {
            if (!this.overFlow) this.count = this.max;
            return true;

        }

        return false;
    }


}