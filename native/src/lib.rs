#[macro_use]
extern crate neon;

use neon::vm::{Call, JsResult, This, FunctionCall};
use neon::js::{JsString, Value};

mod mov;

trait CheckArgument<'a> {
    fn check_argument<V: Value>(&mut self, i: i32) -> JsResult<'a, V>;
}

impl<'a, T: This> CheckArgument<'a> for FunctionCall<'a, T> {
    fn check_argument<V: Value>(&mut self, i: i32) -> JsResult<'a, V> {
        self.arguments.require(self.scope, i)?.check::<V>()
    }
}

fn get_moves(mut call: Call) -> JsResult<JsString> {
    let fen: String = call.check_argument::<JsString>(0)?.value();

    Ok(JsString::new(call.scope, &mov::get_moves(fen)).unwrap())
}

register_module!(m, {
    m.export("getMoves", get_moves)
});