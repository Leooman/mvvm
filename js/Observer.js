class Observer {
    constructor(data){
        this.observe(data)
    }
    observe(data){
        if(!data || typeof data !== "object") return
        Object.keys(data).forEach(key => {
            this.defineReactive(data,key,data[key])
            this.observe(data[key]) //深度劫持
        })
    }
    defineReactive(data, key, val){
        let _this = this
        let dep = new Dep()
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get() {
                Dep.target && dep.addSub(Dep.target)
                return val
            },
            set(newVal) {
                if(newVal !== val){
                    _this.observe(newVal)// 重新赋值如果是对象进行深度劫持
                    val = newVal
                    dep.notify()
                }
            }
        })
    }
}