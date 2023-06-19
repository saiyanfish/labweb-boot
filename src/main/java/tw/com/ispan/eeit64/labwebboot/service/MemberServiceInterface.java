package tw.com.ispan.eeit64.labwebboot.service;

import tw.com.ispan.eeit64.labwebboot.entity.MemberBean;

import java.util.List;

public interface MemberServiceInterface {
    public List<MemberBean> select(MemberBean memberBean);
    public MemberBean insert(MemberBean memberBean);
    public MemberBean update(MemberBean memberBean);
    public boolean delete(MemberBean memberBean);

}
