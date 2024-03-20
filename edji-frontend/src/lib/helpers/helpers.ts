Object.defineProperty(String.prototype, 'ucfirst', {
    value: function() {
        if (this.length === 0) return this;
        if (typeof this !== 'string') return this;
        return this.charAt(0).toUpperCase() + this.slice(1);
    }
});

Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
        if (this.length === 0) return this;
        if (typeof this !== 'string') return this;
        return this.split(' ').map(function(item: string) {
            return item.charAt(0).toUpperCase() + item.slice(1);
        }).join(' ');
    }
});