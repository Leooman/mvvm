class Compile {
    constructor(el,vm){
        this.vm = vm
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.fragment = null
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el)
            this.compile(this.fragment)
            this.el.appendChild(this.fragment)
        }
    }
    nodeToFragment(el) {
        let fragment = document.createDocumentFragment()
        let child
        // 循环取出根节点中的节点并放入文档碎片中
        while (child = el.firstChild) {
            fragment.appendChild(child)
        }
        return fragment
    }
    //获取起始节点下所有节点并且递归遍历所有符合{{}}的指令
    compile(el) {
        let childNodes = el.childNodes
        let self = this
        Array.from(childNodes).forEach(node => {
            let reg = /\{\{(.*)\}\}///{{}}指令的正则
            let text = node.textContent//节点的内容
            //v-model指令和事件指令的解析编译
            if (self.isElementNode(node)) {
                self.compileElement(node);
            } else if (self.isTextNode(node) && reg.test(text)) {  // 判断是否是符合这种形式{{}}的指令
                // self.compileText(node, reg.exec(text)[1])
                self.compileText(node, text)
            }
            if (node.childNodes && node.childNodes.length) {
                self.compile(node)
            }
        })
    }
    // 执行v-model指令和事件指令的解析编译
    compileElement(node) {
        let nodeAttrs = node.attributes
        let self = this
        Array.prototype.forEach.call(nodeAttrs,attr => {
            let attrName = attr.name
            if (self.isDirective(attrName)) {
                let exp = attr.value
                if (self.isEventDirective(attrName)) {
                    self.compileEvent(node, self.vm, exp, attrName)
                } else {
                    self.compileModel(node, self.vm, exp, attrName)
                }
                node.removeAttribute(attrName)
            }
        })
    }
    compileText(node, exp) {
        let self = this
        exp.replace(/\{\{([^}]+)\}\}/g, (...args) => {
            new Watcher(self.vm, args[1], () => {
                node.textContent = self.getText(self.vm.$data,exp)
            })
        })
        node.textContent = self.getText(self.vm.$data,exp)
    }
    compileEvent(node, vm, exp, dir) {
        let eventType = dir.split('@')[1]
        let cb = vm.methods && vm.methods[exp]
        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false)
        }
    }
    compileModel(node, vm, exp, dir) {
        let self = this
        let val = this.vm[exp]
        this.modelUpdater(node, val)
        new Watcher(this.vm, exp, function (value) {
            self.modelUpdater(node, value)
        })
        node.addEventListener('input', function (e) {
            let newValue = e.target.value
            if (val === newValue) return
            self.vm[exp] = newValue
            val = newValue
        })
    }
    // 获取最新文本内容
    getText(data,exp){
        let value = exp.replace(/\{\{([^}]+)\}\}/g, (...args) => {
            return args[1].split(".").reduce((prev, next) => prev[next], data)
        })
        return value
    }
    //更新文本
    updateText(node,value) {
        node.textContent = typeof value == 'undefined' ? '' : value
    }
    //更新模块
    modelUpdater(node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value
    }
    // 判断是是不是v-指令
    isDirective(attr) {
        return attr.indexOf('v-') === 0 || attr.indexOf('@') === 0
    }
    // 判断是是不是@事件指令
    isEventDirective(dir) {
        return dir.indexOf("@") === 0
    }
    // 判断元素节点 元素类型等于1
    isElementNode(node) {
        return node.nodeType == 1
    }
    isTextNode(node) {
        return node.nodeType == 3
    }
}