import React, { Component } from 'react'
import Showdown from 'showdown'
import Prism from 'prismjs'
import './preStyle.css'

let interval
const style = require("raw-loader!./style1.txt") //注意使用raw-loader解析字符串
const style2 = require("raw-loader!./style2.txt")
const resume = require("raw-loader!./resume.txt")

const wirteChars = (that, nodeName, char) => new Promise((resolve) => {
    setTimeout(() => {
        if (nodeName == 'workArea') {
            const origin = that.state.DOMStyleText + char
            const html = Prism.highlight(origin, Prism.languages.css)
            that.setState({
                styleText: html,
                DOMStyleText: origin
            })
            that.contentNode.scrollTop = that.contentNode.scrollHeight
        } else if (nodeName == 'resume') {
            const originResume = that.state.resumeText + char
            const converter = new Showdown.Converter()
            const markdownResume = converter.makeHtml(originResume)
            that.setState({
                resumeText: originResume,
                DOMResumeText: markdownResume
            })
            that.resumeNode.scrollTop = that.resumeNode.scrollHeight
        }
        // 當遇到中文符號就延長時間
        if (char === '？' || char === '，' || char === '！') {
            interval = 800
        } else {
            interval = 22
        }
        // 一定要寫promise函數才能獲得結果
        resolve()
    }, interval)
})

const writeTo = async (that, nodeName, index, text) => {
    // 一次讀一個字,如果讀完就return
    let char = text.slice(index, index + 1)
    index += 1
    if (index > text.length) {
        return
    }
    await wirteChars(that, nodeName, char)
    await writeTo(that, nodeName, index, text)
}

export default class App extends Component {
    constructor (...prop) {
      super(...prop)
      this.state = {
        styleText: ``,
        DOMStyleText: ``,
        resumeText: ``,
        DOMResumeText: ``
      }
    }
    componentDidMount() {
        (async (that) => {
            await writeTo(that, 'workArea', 0, style)
            await writeTo(that, 'resume', 0, resume)
            await writeTo(that, 'workArea', 0, style2)
        })(this)
    }
    render () {
        return (
          <div>
            <div
              className='workArea'
              // 獲取DOM節點
              ref={node => this.contentNode = node}>
              { /* dangerouslySetInnerHTML在div中間不能有任何東西包含空格 */}
              <div dangerouslySetInnerHTML={{ __html: this.state.styleText }} />
              <style dangerouslySetInnerHTML={{ __html: this.state.DOMStyleText }} />
            </div>
            <div
              className='resume'
              ref={node => this.resumeNode = node}
              dangerouslySetInnerHTML={{__html: this.state.DOMResumeText}} />
            <div id='bot' style={{padding: '10px', textAlign: 'center', marginTop: '100px', fontSize: '10px', color: 'rgba(150, 150, 150, 0.8'}}>
              by matl
            </div>
          </div>
        )
      }
    }
    

