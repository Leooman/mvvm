class Dep {
    constructor(){
        this.subs = new Set()
    }
    addSub(watcher){
        this.subs.add(watcher)
    }
    notify(){
        this.subs.forEach(watcher => watcher.update())
    }
}
Dep.target = null