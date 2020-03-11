class Watcher {
    constructor(vm,exp,cb){
        this.vm = vm
        this.exp = exp
        this.cb = cb
        this.util = new CompileUtil()
        this.value = this.get()
    }
    get(){
        Dep.target = this
        let value = this.util.getVal(this.vm,this.exp) // 此处获取值是为了执行defineProperty的get函数，添加watcher依赖到订阅器dep里
        Dep.target = null
        return value
    }
    update(){
        let newValue = this.util.getVal(this.vm,this.exp)
        let oldVal = this.value
        if (newValue !== oldVal) {
            this.value = newValue
            this.cb.call(this.vm, newValue, oldVal)
        }
    }
}