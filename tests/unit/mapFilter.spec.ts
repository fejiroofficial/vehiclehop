import { mount } from "@vue/test-utils";
import MapFilter from "@/components/MapFilter.vue";

describe("MapFilter.vue", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;
  const models = [
    "SMART_42_ELECTRIC",
    "SMART_42_CABRIO",
    "DELOREAN",
    "SMART_42_PASSION"
  ];

  beforeEach(() => {
    wrapper = mount(MapFilter, {
      propsData: {
        models
      }
    });
  });

  it("applies filter", async () => {
    await wrapper.findAll("input[type=checkbox]").setChecked();
    await wrapper.find("input[type=range]").setValue(0.1);
    await wrapper.find(".btn-primary").trigger("click");
    expect(wrapper.emitted("applyFilter")).toBeTruthy();
    expect(wrapper.emitted("applyFilter")).toEqual([["0.1", models]]);
  });
  it("clears filter", async () => {
    await wrapper.find(".btn-tertiary").trigger("click");
    expect(wrapper.emitted("clearFilter")).toBeTruthy();
  });
});
