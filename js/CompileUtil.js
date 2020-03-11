class CompileUtil {
    constructor(){
    	this.updater = {
    		// 文本更新
    		textUpdater(node, value) {
		        node.textContent = value
		    },
		    // 输入框更新
		    modelUpdater(node, value) {
		        node.value = value
		    }
    	}
    }
    getVal(vm,exp){
        return exp.split(".").reduce((prev, next) => prev[next], vm.$data)
    }
    getTextVal(vm, exp) {
	    // 使用正则匹配出 {{ }} 间的变量名，再调用 getVal 获取值
	    return exp.replace(/\{\{([^}]+)\}\}/g, (...args) => {
	        return this.getVal(vm, args[1])
	    })
	}
	setVal(vm, exp, newVal) {
	    return exp.split(".").reduce((prev, next, currentIndex) => {
	        if(currentIndex === exp.length - 1) {
	            return prev[next] = newVal
	        }
	        return prev[next]
	    }, vm.$data)
	}
	model(node, vm, exp) {
	    let updateFn = this.updater["modelUpdater"]
	    let value = this.getVal(vm, exp)
	    new Watcher(vm, exp, newValue => {
	        updateFn && updateFn(node, newValue)
	    })
	    // v-model 双向数据绑定，对 input 添加事件监听
	    node.addEventListener('input', e => {
	        let newValue = e.target.value
	        this.setVal(vm, exp, newValue)
	    })
	    updateFn && updateFn(vm, value)
	}
	text(node, vm, exp) {
	    let updateFn = this.updater["textUpdater"]
	    let value = this.getTextVal(vm, exp)
	    let _this = this
	    exp.replace(/\{\{([^}]+)\}\}/g, (...args) => {
	        // 解析时遇到了模板中需要替换为数据值的变量时，应该添加一个观察者
	        // 当变量重新赋值时，调用更新值节点到 Dom 的方法
	        new Watcher(vm, args[1], () => {
	            // 如果数据发生变化，重新获取新值
	            updateFn && updateFn(node,_this.getTextVal(vm, exp))
	        })
	    })
	    updateFn && updateFn(node, value)
	}
}