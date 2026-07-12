import { cloneDeep } from 'lodash-es'

interface TreeNode<T> {
  children?: T[]
  [key: string]: any
}

export const treeUtil = {
  // 遍历
  // 特性1：返回false代表截断，不再向下遍历
  tranverse<T extends TreeNode<T>>(root: T | T[], callback: (node: T, args: any) => any) {
    if (!root) {
      return
    }

    function inner(root: T, args: any): any {
      const breakFlag = callback(root as T, args)
      if (breakFlag === false) {
        return
      }
      const children = root.children || []
      for (let i = 0, len = children.length; i < len; i++) {
        const origin = { ...args }
        inner(children[i] as T, { ...args, parent: root })
        args = origin
      }
      return
    }
    if (Array.isArray(root)) {
      root.forEach(r => inner(r, { parent: null }))
    } else {
      inner(root, { parent: null })
    }
    return
  },
  search<T extends TreeNode<T>>(root: T | T[], callback: (node: T) => any, mode = 'node') {
    if (!root) {
      return null
    }
    if (Array.isArray(root)) {
      root = {
        __fake: true,
        children: root,
      } as any as T
    }
    const paths: T[] = []
    function traverse(root: T): T | any {
      const children = root.children || []
      !root.__fake && paths.push(root)
      if (!root.__fake) {
        paths.push(root)
        if (callback(root as any)) {
          return root
        }
      }
      for (let i = 0, len = children.length; i < len; i++) {
        const node = traverse(children[i])
        if (node) {
          return node
        }
      }
      !root.__fake && paths.pop()
      return false
    }
    const result = traverse(root)
    if (result) {
      return mode === 'node' ? result : paths
    }
    return false
  },
  filter<T extends TreeNode<T>>(root: T | T[], callback: (node: T, args: any) => any, mode = 'node') {
    if (!root) {
      return root
    }
    if (Array.isArray(root)) {
      root = {
        _fake: true,
        children: root,
      } as any as T
    }
    root = cloneDeep(root)

    function check(node: T, args: any): any {
      const origin = { ...args }
      node.children = node.children?.filter(ch => check(ch, args))
      args = origin

      return callback(node, args)
    }

    root.children = root.children?.filter(item => check(item, {}))
    return root._fake ? root.children : root
  },
}
