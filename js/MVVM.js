class MVVM {
    constructor(options){
        this.$el = options.el
        this.$data = options.data
        this.methods = options.methods
        new Observer(this.$data)        //数据劫持
        this.proxyData(this.$data)      //将数据代理到实例上
        new Compile(this.$el, this)
        options.mounted.call(this)
        return this
    }
    proxyData(data){
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                enumerable: true,
                configurable: true,
                get() {
                    return data[key]
                },
                set(newVal) {
                    data[key] = newVal
                }
            })
        })
    }
}