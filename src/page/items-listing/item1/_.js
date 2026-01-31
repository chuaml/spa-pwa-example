import { Item } from "../Item.mjs";

// code here run everytime when this page load
export default function main(appBody) {
    const viewModel = new Item();
    viewModel.intro();

    console.log({ viewModel });
}