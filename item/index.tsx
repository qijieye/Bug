import { Component, Element, Event, EventEmitter, h, Listen, Method, Prop } from "@stencil/core"

@Component({
	tag: "smoothly-item",
	styleUrl: "style.css",
	scoped: true,
})
export class Item {
	@Element() element: HTMLSmoothlyItemElement
	@Prop() value: any
	@Prop({ reflect: true, mutable: true }) selected: boolean
	@Event() itemLoaded: EventEmitter<void>
	@Event() itemSelected: EventEmitter<void>

	componentWillLoad() {
		if (this.selected)
			this.itemSelected.emit()
	}
	@Listen("click")
	onClick() {
		this.selected = true
		this.componentWillLoad()
	}

	@Method()
	async filter(filter: string): Promise<boolean> {
		const result = !(this.element.hidden = filter
			? !(this.value.toLowerCase().includes(filter) || this.element.innerText.toLowerCase().includes(filter))
			: false)
		return result
	}
	render() {
		return <slot />
	}
	// componentDidRender() {
	// 	if (this.selected)
	// 		console.log("selecteditem did render", this.value)
	// }
}
