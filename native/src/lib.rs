
#[macro_use]
extern crate neon;
extern crate chess;

use neon::vm::{Call, JsResult, This, FunctionCall};
use neon::js::{JsString, Value};
use chess::{Chess};

fn test() {
    let pos = Chess::default();
    let legals = pos.legals();
    assert_eq!(legals.len(), 20);
}

/*
fn get_move(mut call: Call) -> JsResult<JsString> {
    let fen: String = call.check_argument::<JsString>(0)?.value();

    let mut list = MoveVec::new();
    let position = &Position::from_fen(&fen).unwrap();
    legal_moves::<MoveVec>(position, &mut list);

    for item in list.iter() {
        println!("{:#?}", item);
    }

    Ok(JsString::new(call.scope, "e2e4").unwrap())
}
*/

fn hello_node(call: Call) -> JsResult<JsString> {
    let scope = call.scope;
    Ok(JsString::new(scope, "hello node").unwrap())
}

register_module!(m, {
    //m.export("get_moves", get_move);
    m.export("hello_node", hello_node);
    Ok(())
});