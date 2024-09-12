import IntegerInput from "@/components/api-flow/components/param-input-bar/input-param/IntegerInput.vue";
import DateInput from "./DateInput.vue";
import DatetimeInput from "./DatetimeInput.vue";
import DoubleInput from "./DoubleInput.vue";
import EnumInput from "./EnumInput.vue";
import FloatInput from "./FloatInput.vue";
import SetInput from "./SetInput.vue";
import StringInput from "./StringInput.vue";
import TextInput from "./TextInput.vue";
import OptionInput from "./OptionInput.vue";
import BooleanInput from "./BooleanInput.vue";

const components = {
    integer: IntegerInput,
    date: DateInput,
    datetime: DatetimeInput,
    double: DoubleInput,
    enum: EnumInput,
    float: FloatInput,
    set: SetInput,
    string: StringInput,
    text: TextInput,
    option: OptionInput,
    boolean: BooleanInput,
};
export {components}