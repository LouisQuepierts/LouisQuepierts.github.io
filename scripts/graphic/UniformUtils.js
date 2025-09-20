import {Editor} from "../system/Editor.js";

export class UniformUtils {
    static vector2(name, out) {
        out.x = Editor.get(name + "[0]");
        out.y = Editor.get(name + "[1]");
    }
    
    static vector3(name, out) {
        out.x = Editor.get(name + "[0]");
        out.y = Editor.get(name + "[1]");
        out.z = Editor.get(name + "[2]");
    }
    
    static vector4(name, out) {
        out.x = Editor.get(name + "[0]");
        out.y = Editor.get(name + "[1]");
        out.z = Editor.get(name + "[2]");
        out.w = Editor.get(name + "[3]");
    }
    
    static color(name, out) {
        const hex = Editor.get(name);
        out.set(hex);
    }
}