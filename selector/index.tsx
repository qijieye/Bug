import { Component, Element, Event, EventEmitter, h, Host, Listen, Prop, State, Watch } from "@stencil/core"

@Component({
	tag: "smoothly-selector",
	styleUrl: "style.css",
	scoped: true,
})
export class Selector {
	@Element() element: HTMLSmoothlySelectorElement
	@Prop({ mutable: true }) value?: any
	@Prop({ mutable: true }) open: boolean
	@State() opened = false
	@State() items: HTMLSmoothlyItemElement[] = []
	@State() selectedElement?: HTMLSmoothlyItemElement
	@State() asideError = false
	mainElement?: HTMLElement
	@State() filter = ""
	@Event() selected: EventEmitter<any>
	aside?: HTMLElement

	@Watch("selectedElement")
	onSelectedChange(value: HTMLSmoothlyItemElement | undefined, old: HTMLSmoothlyItemElement | undefined) {
		if (old)
			old.selected = false
	}
	@Watch("filter")
	async onFilterChange(value: string) {
		value = value.toLowerCase()

		if (!(await Promise.all(this.items.map(item => item.filter(value)))).some(r => r)) {
			this.asideError = true
			this.items.forEach(el => el.filter(""))
		} else {
			this.asideError = false
			console.log("")
		}
	}
	@Listen("click")
	onClick(event: UIEvent) {
		event.stopPropagation()
		this.opened = !this.opened
		this.open = !this.open
	}
	@Listen("itemLoaded")
	onItemLoaded(event: Event) {
		this.items.push(event.target as HTMLSmoothlyItemElement)
	}
	@Listen("itemSelected")
	onItemSelected(event: Event) {
		this.selectedElement = event.target as HTMLSmoothlyItemElement
		if (this.mainElement)
			this.mainElement.innerHTML = this.selectedElement.innerHTML
		console.log("selected Element", this.selectedElement.value, this.selectedElement.selected)
	}
	@Listen("keydown")
	onKeyDown(event: KeyboardEvent) {
		console.log("key", event.key)
		let move = 0
		switch (event.key) {
			case "ArrowUp":
				move = -1
				break
			case "ArrowDown":
				move = 1
				break
			case "Escape":
				this.filter = ""
				break
			case "Backspace":
				this.filter = this.filter.slice(0, -1)
				break
			case "Enter":
				this.selected?.emit(this.selectedElement)
				break
			default:
				if (event.key.length == 1)
					this.filter += event.key
				break
		}
		if (move) {
			let selectedIndex = this.items.findIndex(item => item == this.selectedElement)
			if (selectedIndex == -1)
				selectedIndex = 0
			;(this.selectedElement = this.items[
				(selectedIndex + move + this.items.length) % this.items.length
			]).selected = true
		}
	}
	render() {
		return (
			<Host tabIndex={2}>
				<main ref={element => (this.mainElement = element)}>(none)</main>
				{this.filter.length != 0 ? (
					<aside
						ref={element => (this.aside = element)}
						style={
							this.asideError
								? { backgroundColor: "rgb(var(--smoothly-primary-color))" }
								: { backgroundColor: "rgb(var(--smoothly-dark-shade)" }
						}>
						{this.filter}
						<button onClick={() => (this.filter = "")}>x</button>
					</aside>
				) : undefined}
				{this.open ? <div onClick={() => (this.open = true)}></div> : []}
				<nav style={{ display: !this.opened ? "none" : "flex" }} class={this.open ? "" : "hide"}>
					<slot />
				</nav>
			</Host>
		)
	}
	// componentDidRender() {
	// 	if (!this.opened)
	// 		this.items.find(item => item == this.selected)?.childNodes.forEach(node => this.element.append(node))
	// }
}
