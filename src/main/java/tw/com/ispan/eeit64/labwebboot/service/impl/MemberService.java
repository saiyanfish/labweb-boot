package tw.com.ispan.eeit64.labwebboot.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tw.com.ispan.eeit64.labwebboot.entity.MemberBean;
import tw.com.ispan.eeit64.labwebboot.repository.RepositoryMember;
import tw.com.ispan.eeit64.labwebboot.service.MemberServiceInterface;

import javax.persistence.Entity;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MemberService implements MemberServiceInterface {

    @Autowired
    private RepositoryMember repositoryMember;


    @Override
    public List<MemberBean> select(MemberBean memberBean) {
        List<MemberBean> result = new ArrayList<MemberBean>();
        if (memberBean != null && memberBean.getId() != null && !memberBean.getId().equals(0)) {
            Optional<MemberBean> temp = repositoryMember.findById(memberBean.getId());
            if (temp.isPresent()) {
                result.add(temp.get());
            }
        } else {
            result = repositoryMember.findAll();
        }
        return result;
    }

    @Override
    public MemberBean insert(MemberBean memberBean) {
        MemberBean result = null;
        if (memberBean != null && memberBean.getId() != null) {
            if (!repositoryMember.existsById(memberBean.getId())) {
                memberBean.setId(null);
                result = repositoryMember.save(memberBean);
            }
        }

        return result;
    }
    public MemberBean insertWithoutId(MemberBean memberBean) {
        MemberBean result = repositoryMember.save(memberBean);
        return result;
    }

    @Override
    public MemberBean update(MemberBean memberBean) {
        MemberBean result = null;
        if (memberBean != null && memberBean.getId() != null) {
            if (repositoryMember.existsById(memberBean.getId())) {
                result = repositoryMember.save(memberBean);
            }
        }
        return result;
    }

    @Override
    public boolean delete(MemberBean memberBean) {
        boolean result = false;
        if (memberBean != null && memberBean.getId() != null) {
            repositoryMember.deleteById(memberBean.getId());
            result = true;
        }

        return result;
    }
}
